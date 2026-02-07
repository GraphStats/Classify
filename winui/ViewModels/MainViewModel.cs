using Classify.WinUI.Models;
using Classify.WinUI.Services;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace Classify.WinUI.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly DataStore _store = new();
    private readonly ObservableCollection<Subject> _subjects = new();
    private readonly ObservableCollection<RevisionEvent> _events = new();

    public ObservableCollection<SubjectItemViewModel> Subjects { get; } = new();
    public ObservableCollection<RevisionEvent> RevisionEvents => _events;

    [ObservableProperty] private string? activeSubjectId;
    [ObservableProperty] private AppSettings settings = new();
    [ObservableProperty] private bool isBusy;

    public Subject? GetSubjectById(string id) => _subjects.FirstOrDefault(s => s.Id == id);

    public async Task InitializeAsync()
    {
        if (IsBusy) return;
        IsBusy = true;
        try
        {
            var subjects = await _store.LoadSubjectsAsync();
            _subjects.Clear();
            Subjects.Clear();
            foreach (var s in subjects)
            {
                _subjects.Add(s);
                Subjects.Add(ToItemVm(s));
            }

            var events = await _store.LoadEventsAsync();
            _events.Clear();
            foreach (var ev in events) _events.Add(ev);

            Settings = await _store.LoadSettingsAsync();
        }
        finally
        {
            IsBusy = false;
        }
    }

    public async Task<SubjectItemViewModel?> AddSubjectAsync(string name, string emoji)
    {
        var subject = new Subject
        {
            Name = name,
            Emoji = emoji
        };

        _subjects.Add(subject);
        var itemVm = ToItemVm(subject);
        Subjects.Add(itemVm);
        await _store.SaveSubjectsAsync(_subjects);
        return itemVm;
    }

    public async Task UpdateSubjectAsync(Subject updated)
    {
        var existing = _subjects.FirstOrDefault(s => s.Id == updated.Id);
        if (existing is null) return;

        var index = _subjects.IndexOf(existing);
        _subjects[index] = updated;

        var vm = Subjects.FirstOrDefault(s => s.Id == updated.Id);
        if (vm is not null)
        {
            vm.Name = updated.Name;
            vm.Emoji = updated.Emoji;
        }
        await _store.SaveSubjectsAsync(_subjects);
    }

    public async Task DeleteSubjectAsync(string subjectId)
    {
        var subject = _subjects.FirstOrDefault(s => s.Id == subjectId);
        if (subject is null) return;
        _subjects.Remove(subject);

        var vm = Subjects.FirstOrDefault(s => s.Id == subjectId);
        if (vm is not null) Subjects.Remove(vm);

        if (ActiveSubjectId == subjectId) ActiveSubjectId = null;
        await _store.SaveSubjectsAsync(_subjects);
    }

    public async Task AddCourseAsync(string subjectId, string name, string description, string filePath)
    {
        var subject = _subjects.FirstOrDefault(s => s.Id == subjectId);
        if (subject is null) return;

        subject.Courses.Add(new Course
        {
            Name = name,
            Description = description,
            FilePath = filePath
        });
        await _store.SaveSubjectsAsync(_subjects);
    }

    public async Task RemoveCourseAsync(string subjectId, string courseId)
    {
        var subject = _subjects.FirstOrDefault(s => s.Id == subjectId);
        if (subject is null) return;
        subject.Courses.RemoveAll(c => c.Id == courseId);
        await _store.SaveSubjectsAsync(_subjects);
    }

    public async Task AddEventAsync(string subjectId, string title, DateTime date)
    {
        _events.Add(new RevisionEvent
        {
            SubjectId = subjectId,
            Title = title,
            Date = date
        });
        await _store.SaveEventsAsync(_events);
    }

    public async Task ToggleEventStatusAsync(string eventId)
    {
        var ev = _events.FirstOrDefault(e => e.Id == eventId);
        if (ev is null) return;
        ev.Status = ev.Status == "done" ? "pending" : "done";
        await _store.SaveEventsAsync(_events);
    }

    public Task SaveEventsAsync() => _store.SaveEventsAsync(_events);

    public async Task SaveSettingsAsync(AppSettings settings)
    {
        Settings = settings;
        await _store.SaveSettingsAsync(settings);
    }

    private static SubjectItemViewModel ToItemVm(Subject subject) =>
        new()
        {
            Id = subject.Id,
            Name = subject.Name,
            Emoji = subject.Emoji
        };
}
