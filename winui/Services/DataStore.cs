using Classify.WinUI.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Windows.Storage;

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

    public async Task<IList<Subject>> LoadSubjectsAsync()
    {
        var file = await TryGetFileAsync(SubjectsFile);
        if (file is null) return new List<Subject>();
        using var stream = await file.OpenStreamForReadAsync();
        return await JsonSerializer.DeserializeAsync<List<Subject>>(stream, _options) ?? new List<Subject>();
    }

    public async Task SaveSubjectsAsync(IEnumerable<Subject> subjects)
    {
        var file = await CreateFileAsync(SubjectsFile);
        using var stream = await file.OpenStreamForWriteAsync();
        stream.SetLength(0);
        await JsonSerializer.SerializeAsync(stream, subjects, _options);
    }

    public async Task<IList<RevisionEvent>> LoadEventsAsync()
    {
        var file = await TryGetFileAsync(EventsFile);
        if (file is null) return new List<RevisionEvent>();
        using var stream = await file.OpenStreamForReadAsync();
        return await JsonSerializer.DeserializeAsync<List<RevisionEvent>>(stream, _options) ?? new List<RevisionEvent>();
    }

    public async Task SaveEventsAsync(IEnumerable<RevisionEvent> events)
    {
        var file = await CreateFileAsync(EventsFile);
        using var stream = await file.OpenStreamForWriteAsync();
        stream.SetLength(0);
        await JsonSerializer.SerializeAsync(stream, events, _options);
    }

    public async Task<AppSettings> LoadSettingsAsync()
    {
        var file = await TryGetFileAsync(SettingsFile);
        if (file is null) return new AppSettings();
        using var stream = await file.OpenStreamForReadAsync();
        return await JsonSerializer.DeserializeAsync<AppSettings>(stream, _options) ?? new AppSettings();
    }

    public async Task SaveSettingsAsync(AppSettings settings)
    {
        var file = await CreateFileAsync(SettingsFile);
        using var stream = await file.OpenStreamForWriteAsync();
        stream.SetLength(0);
        await JsonSerializer.SerializeAsync(stream, settings, _options);
    }

    private static async Task<StorageFile> CreateFileAsync(string name)
    {
        var folder = ApplicationData.Current.LocalFolder;
        return await folder.CreateFileAsync(name, CreationCollisionOption.OpenIfExists);
    }

    private static async Task<StorageFile?> TryGetFileAsync(string name)
    {
        var folder = ApplicationData.Current.LocalFolder;
        try
        {
            return await folder.GetFileAsync(name);
        }
        catch (FileNotFoundException)
        {
            return null;
        }
    }
}
