using CommunityToolkit.Mvvm.ComponentModel;

namespace Classify.WinUI.ViewModels;

public partial class SubjectItemViewModel : ObservableObject
{
    [ObservableProperty] private string id = string.Empty;
    [ObservableProperty] private string name = string.Empty;
    [ObservableProperty] private string emoji = "📚";
}
