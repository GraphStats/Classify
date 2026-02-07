using Classify.WinUI.ViewModels;

namespace Classify.WinUI.Models;

public class SubjectNavigationParameter
{
    public required string SubjectId { get; init; }
    public required MainViewModel ViewModel { get; init; }
}
