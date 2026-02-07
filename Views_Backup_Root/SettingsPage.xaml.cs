using Classify.WinUI.Models;
using Classify.WinUI.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System.Linq;
using System.Threading.Tasks;

namespace Classify.WinUI.Views;

public sealed partial class SettingsPage : Page
{
    public MainViewModel? ViewModel { get; private set; }

    public SettingsPage()
    {
        InitializeComponent();
    }

    protected override void OnNavigatedTo(NavigationEventArgs e)
    {
        base.OnNavigatedTo(e);
        ViewModel = e.Parameter as MainViewModel;
        if (ViewModel?.Settings is AppSettings settings)
        {
            NameBox.Text = settings.UserName ?? string.Empty;
            var tag = settings.Theme ?? "light";
            var item = ThemeCombo.Items.OfType<ComboBoxItem>().FirstOrDefault(i => (string)i.Tag == tag);
            if (item != null) ThemeCombo.SelectedItem = item;
        }
    }

    private async void OnSaveClick(object sender, RoutedEventArgs e)
    {
        if (ViewModel is null) return;
        var selected = ThemeCombo.SelectedItem as ComboBoxItem;
        var theme = (string?)selected?.Tag ?? "light";
        await ViewModel.SaveSettingsAsync(new AppSettings
        {
            Theme = theme,
            UserName = NameBox.Text
        });
    }
}
