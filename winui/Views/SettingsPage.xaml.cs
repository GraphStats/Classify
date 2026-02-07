using Classify.WinUI.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System.Linq;
using System;
using Windows.Foundation;

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
        
        if (ViewModel != null)
        {
            NameBox.Text = ViewModel.Settings.UserName ?? "";
            var theme = ViewModel.Settings.Theme ?? "light";
            var item = ThemeCombo.Items.Cast<ComboBoxItem>().FirstOrDefault(i => i.Tag.ToString() == theme);
            if (item != null) ThemeCombo.SelectedItem = item;
        }
    }

    private async void OnSaveClick(object sender, RoutedEventArgs e)
    {
        if (ViewModel == null) return;

        ViewModel.Settings.UserName = NameBox.Text;
        if (ThemeCombo.SelectedItem is ComboBoxItem item)
        {
            ViewModel.Settings.Theme = item.Tag.ToString();
        }

        await ViewModel.SaveSettingsAsync(ViewModel.Settings);
        
        if (this.Content is FrameworkElement root)
        {
            root.RequestedTheme = ViewModel.Settings.Theme?.ToLower() switch
            {
                "dark" => ElementTheme.Dark,
                "light" => ElementTheme.Light,
                _ => ElementTheme.Default
            };
        }
        var dialog = new ContentDialog
        {
            XamlRoot = this.XamlRoot,
            Title = "Succès",
            Content = "Paramètres enregistrés avec succès.",
            CloseButtonText = "OK"
        };
        await dialog.ShowAsync();
    }

    private void OnThemeChanged(object sender, SelectionChangedEventArgs e)
    {
        // Real-time theme switching could be implemented here
    }
}
