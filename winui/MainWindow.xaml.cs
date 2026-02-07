using Classify.WinUI.ViewModels;
using Classify.WinUI.Views;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;

namespace Classify.WinUI;

public sealed partial class MainWindow : Window
{
    public static MainWindow? Instance { get; private set; }
    public MainViewModel ViewModel { get; } = new();

    public MainWindow()
    {
        Instance = this;
        this.InitializeComponent();
        ExtendsContentIntoTitleBar = true;
        SetTitleBar(null); 
        
        SystemBackdrop = new Microsoft.UI.Xaml.Media.MicaBackdrop();
    }

    private async void NavView_Loaded(object sender, RoutedEventArgs e)
    {
        await ViewModel.InitializeAsync();
        ApplyTheme();
        NavView.SelectedItem = NavView.MenuItems[0];
        ContentFrame.Navigate(typeof(HomePage), ViewModel);
    }

    internal void ApplyTheme()
    {
        if (this.Content is FrameworkElement rootElement)
        {
            var theme = ViewModel.Settings.Theme?.ToLower() switch
            {
                "dark" => ElementTheme.Dark,
                "light" => ElementTheme.Light,
                _ => ElementTheme.Default
            };
            rootElement.RequestedTheme = theme;
        }
    }

    private void NavView_ItemInvoked(NavigationView sender, NavigationViewItemInvokedEventArgs args)
    {
        if (args.IsSettingsInvoked)
        {
            ContentFrame.Navigate(typeof(SettingsPage), ViewModel);
            return;
        }

        var tag = args.InvokedItemContainer?.Tag?.ToString();
        switch (tag)
        {
            case "home":
                ContentFrame.Navigate(typeof(HomePage), ViewModel);
                break;
            case "calendar":
                ContentFrame.Navigate(typeof(CalendarPage), ViewModel);
                break;
            case "add_subject":
                _ = ShowAddSubjectDialog();
                break;
        }
    }

    private async System.Threading.Tasks.Task ShowAddSubjectDialog()
    {
        var nameBox = new TextBox { PlaceholderText = "Nom de la matière" };
        var emojiBox = new TextBox { PlaceholderText = "Emoji", Text = "📚" };

        var dialog = new ContentDialog
        {
            XamlRoot = this.Content.XamlRoot,
            Title = "Nouvelle matière",
            PrimaryButtonText = "Créer",
            CloseButtonText = "Annuler",
            DefaultButton = ContentDialogButton.Primary,
            Content = new StackPanel
            {
                Spacing = 12,
                Children = { nameBox, emojiBox }
            }
        };

        var result = await dialog.ShowAsync();
        if (result == ContentDialogResult.Primary && !string.IsNullOrWhiteSpace(nameBox.Text))
        {
            var newSubject = await ViewModel.AddSubjectAsync(nameBox.Text.Trim(), string.IsNullOrWhiteSpace(emojiBox.Text) ? "📚" : emojiBox.Text.Trim());
            if (newSubject != null)
            {
                ContentFrame.Navigate(typeof(SubjectPage), new Classify.WinUI.Models.SubjectNavigationParameter { SubjectId = newSubject.Id, ViewModel = ViewModel });
            }
        }
    }
}
