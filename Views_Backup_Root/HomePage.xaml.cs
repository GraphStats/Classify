using Classify.WinUI.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Linq;
using System.Threading.Tasks;
using Classify.WinUI.Models;

namespace Classify.WinUI.Views;

public sealed partial class HomePage : Page
{
    public MainViewModel? ViewModel { get; private set; }

    public HomePage()
    {
        InitializeComponent();
    }

    protected override void OnNavigatedTo(NavigationEventArgs e)
    {
        base.OnNavigatedTo(e);
        ViewModel = e.Parameter as MainViewModel ?? DataContext as MainViewModel;
        DataContext = ViewModel;
    }

    private void OnSubjectClick(object sender, ItemClickEventArgs e)
    {
        if (ViewModel is null) return;
        if (e.ClickedItem is SubjectItemViewModel subject)
        {
            ViewModel.ActiveSubjectId = subject.Id;
            Frame.Navigate(typeof(SubjectPage), new SubjectNavigationParameter { SubjectId = subject.Id, ViewModel = ViewModel });
        }
    }

    private async void OnCreateSubjectClick(object sender, RoutedEventArgs e)
    {
        if (ViewModel is null) return;
        var nameBox = new TextBox { PlaceholderText = "Nom de la matière" };
        var emojiBox = new TextBox { PlaceholderText = "Emoji", Text = "📚" };

        var dialog = new ContentDialog
        {
            XamlRoot = this.XamlRoot,
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
                Frame.Navigate(typeof(SubjectPage), new SubjectNavigationParameter { SubjectId = newSubject.Id, ViewModel = ViewModel });
            }
        }
    }
}
