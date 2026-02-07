using System;
using System.Collections.Generic;

namespace Classify.WinUI.Models;

public class Folder
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public List<Course> Courses { get; set; } = new();
    public bool IsStarred { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
