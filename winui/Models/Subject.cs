using System;
using System.Collections.Generic;

namespace Classify.WinUI.Models;

public class Subject
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Emoji { get; set; } = "📚";
    public List<Course> Courses { get; set; } = new();
    public List<Folder> Folders { get; set; } = new();
    public bool IsStarred { get; set; }
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}
