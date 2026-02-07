using Classify.WinUI.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace Classify.WinUI.Services;

public class DataStore
{
    private const string SubjectsFile = "subjects.json";
    private const string EventsFile = "revisionEvents.json";
    private const string SettingsFile = "settings.json";
    private readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    private static string BasePath => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Classify");

    public async Task<IList<Subject>> LoadSubjectsAsync()
    {
        string path = Path.Combine(BasePath, SubjectsFile);
        if (!File.Exists(path)) return new List<Subject>();
        try {
            using var stream = File.OpenRead(path);
            return await JsonSerializer.DeserializeAsync<List<Subject>>(stream, _options) ?? new List<Subject>();
        } catch { return new List<Subject>(); }
    }

    public async Task SaveSubjectsAsync(IEnumerable<Subject> subjects)
    {
        Directory.CreateDirectory(BasePath);
        string path = Path.Combine(BasePath, SubjectsFile);
        using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, subjects, _options);
    }

    public async Task<IList<RevisionEvent>> LoadEventsAsync()
    {
        string path = Path.Combine(BasePath, EventsFile);
        if (!File.Exists(path)) return new List<RevisionEvent>();
        try {
            using var stream = File.OpenRead(path);
            return await JsonSerializer.DeserializeAsync<List<RevisionEvent>>(stream, _options) ?? new List<RevisionEvent>();
        } catch { return new List<RevisionEvent>(); }
    }

    public async Task SaveEventsAsync(IEnumerable<RevisionEvent> events)
    {
        Directory.CreateDirectory(BasePath);
        string path = Path.Combine(BasePath, EventsFile);
        using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, events, _options);
    }

    public async Task<AppSettings> LoadSettingsAsync()
    {
        string path = Path.Combine(BasePath, SettingsFile);
        if (!File.Exists(path)) return new AppSettings();
        try {
            using var stream = File.OpenRead(path);
            return await JsonSerializer.DeserializeAsync<AppSettings>(stream, _options) ?? new AppSettings();
        } catch { return new AppSettings(); }
    }

    public async Task SaveSettingsAsync(AppSettings settings)
    {
        Directory.CreateDirectory(BasePath);
        string path = Path.Combine(BasePath, SettingsFile);
        using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, settings, _options);
    }
}
