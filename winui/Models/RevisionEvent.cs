using System;

namespace Classify.WinUI.Models;

public class RevisionEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string SubjectId { get; set; } = string.Empty;
    public string? CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.Today;
    public string Status { get; set; } = "pending"; // pending | done

    public bool IsDone
    {
        get => Status == "done";
        set => Status = value ? "done" : "pending";
    }
}
