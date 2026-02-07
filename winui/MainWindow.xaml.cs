using Classify.WinUI.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.ComponentModel;
using System.Threading.Tasks;

namespace Classify.WinUI;

public sealed partial class MainWindow : Window
{
    public MainViewModel ViewModel => (MainViewModel)DataContext;

    public MainWindow()
    {
        InitializeComponent();
        Loaded += OnLoaded;
    }

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        await ViewModel.InitializeAsync();
        ViewModel.PropertyChanged += OnViewModelPropertyChanged;
        ApplyTheme(ViewModel.Settings.Theme);
        ShellNav.SelectedItem = ShellNav.MenuItems[0];
        NavigateTo("home");
    }

    private void NavigateTo(string tag, object? parameter = null)
    {
        switch (tag)
        {
            case "home":
                ContentFrame.Navigate(typeof(Views.HomePage), ViewModel);
                break;
            case "calendar":
                ContentFrame.Navigate(typeof(Views.CalendarPage), ViewModel);
                break;
            case "settings":
                ContentFrame.Navigate(typeof(Views.SettingsPage), ViewModel);
                break;
            default:
                if (parameter is Models.SubjectNavigationParameter nav)
                {
                    ContentFrame.Navigate(typeof(Views.SubjectPage), nav);
                }
                break;
        }
    }

    private void OnViewModelPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        if (e.PropertyName == nameof(ViewModel.Settings))
        {
            ApplyTheme(ViewModel.Settings.Theme);
        }
    }

    private void ApplyTheme(string? theme)
    {
        ElementTheme target = ElementTheme.Default;
        if (string.Equals(theme, "dark", StringComparison.OrdinalIgnoreCase)) target = ElementTheme.Dark;
        if (string.Equals(theme, "light", StringComparison.OrdinalIgnoreCase)) target = ElementTheme.Light;
        ShellNav.RequestedTheme = target;
        ContentFrame.RequestedTheme = target;
    }

    private void OnNavigationSelectionChanged(NavigationView sender, NavigationViewSelectionChangedEventArgs args)
    {
        if (args.SelectedItem is NavigationViewItem navItem && navItem.Tag is string tag)
        {
            NavigateTo(tag);
            return;
        }

        if (args.SelectedItem is SubjectItemViewModel subject)
        {
            ViewModel.ActiveSubjectId = subject.Id;
            NavigateTo("subject", new Models.SubjectNavigationParameter { SubjectId = subject.Id, ViewModel = ViewModel });
        }
    }

    private void OnItemInvoked(NavigationView sender, NavigationViewItemInvokedEventArgs args)
    {
        if (args.InvokedItemContainer is NavigationViewItem navItem && navItem.Tag is string tag)
        {
            NavigateTo(tag);
        }
    }

    private async void OnAddSubjectClick(object sender, RoutedEventArgs e)
    {
        var nameBox = new TextBox { PlaceholderText = "Nom de la matière" };
        var emojiBox = new TextBox { PlaceholderText = "Emoji (ex: 📚)", Text = "📚" };

        var dialog = new ContentDialog
        {
            XamlRoot = ContentFrame.XamlRoot,
            Title = "Nouvelle matière",
            PrimaryButtonText = "Créer",
            CloseButtonText = "Annuler",
            DefaultButton = ContentDialogButton.Primary,
            Content = new StackPanel
            {
                Spacing = 12,
                Children =
                {
                    nameBox,
                    emojiBox
                }
            }
        };

        var result = await dialog.ShowAsync();
        if (result == ContentDialogResult.Primary && !string.IsNullOrWhiteSpace(nameBox.Text))
        {
            var subject = await ViewModel.AddSubjectAsync(nameBox.Text.Trim(), string.IsNullOrWhiteSpace(emojiBox.Text) ? "📚" : emojiBox.Text.Trim());
            if (subject != null)
            {
                ShellNav.SelectedItem = subject;
                NavigateTo("subject", new Models.SubjectNavigationParameter { SubjectId = subject.Id, ViewModel = ViewModel });
            }
        }
    }
}
