using Classify.WinUI.Models;
using Classify.WinUI.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.IO;
using System.Threading.Tasks;
using Windows.System;
using System;
using Windows.Foundation;
using System.Collections.Generic;

namespace Classify.WinUI.Views;

public sealed partial class SubjectPage : Page
{
    public MainViewModel? ViewModel { get; private set; }
    public Subject? Subject { get; private set; }

    public SubjectPage()
    {
        InitializeComponent();
    }

    protected override void OnNavigatedTo(NavigationEventArgs e)
    {
        base.OnNavigatedTo(e);
        if (e.Parameter is Models.SubjectNavigationParameter nav)
        {
            ViewModel = nav.ViewModel;
            Subject = nav.ViewModel.GetSubjectById(nav.SubjectId);
        }

        if (Subject is not null)
        {
            DataContext = Subject;
        }
    }

    private async void OnAddCourseClick(object sender, RoutedEventArgs e)
    {
        if (ViewModel is null || Subject is null) return;

        var nameBox = new TextBox { PlaceholderText = "Nom du cours" };
        var descBox = new TextBox { PlaceholderText = "Description", Text = "Importé manuellement" };
        var pathBox = new TextBox { PlaceholderText = "Chemin du fichier (optionnel)" };

        var dialog = new ContentDialog
        {
            XamlRoot = this.XamlRoot,
            Title = "Ajouter un cours",
            PrimaryButtonText = "Ajouter",
            CloseButtonText = "Annuler",
            DefaultButton = ContentDialogButton.Primary,
            Content = new StackPanel
            {
                Spacing = 12,
                Children = { nameBox, descBox, pathBox }
            }
        };

        var result = await dialog.ShowAsync();
        if (result == ContentDialogResult.Primary && !string.IsNullOrWhiteSpace(nameBox.Text))
        {
            await ViewModel.AddCourseAsync(Subject.Id, nameBox.Text.Trim(), descBox.Text.Trim(), pathBox.Text.Trim());
            RefreshSubject();
        }
    }

    private async void OnDeleteCourseClick(object sender, RoutedEventArgs e)
    {
        if (ViewModel is null || Subject is null) return;
        if (sender is Button btn && btn.Tag is string courseId)
        {
            await ViewModel.RemoveCourseAsync(Subject.Id, courseId);
            RefreshSubject();
        }
    }

    private void RefreshSubject()
    {
        if (ViewModel is null || Subject is null) return;
        Subject = ViewModel.GetSubjectById(Subject.Id);
        DataContext = null;
        DataContext = Subject;
    }

    private async void OnDeleteSubjectClick(object sender, RoutedEventArgs e)
    {
        if (ViewModel is null || Subject is null) return;
        var dialog = new ContentDialog
        {
            XamlRoot = this.XamlRoot,
            Title = "Supprimer la matière ?",
            Content = "Tous les cours associés seront supprimés.",
            PrimaryButtonText = "Supprimer",
            CloseButtonText = "Annuler",
            DefaultButton = ContentDialogButton.Close
        };

        var result = await dialog.ShowAsync();
        if (result == ContentDialogResult.Primary)
        {
            await ViewModel.DeleteSubjectAsync(Subject.Id);
            Frame.GoBack();
        }
    }

    private async void OnOpenCourseClick(object sender, RoutedEventArgs e)
    {
        if (sender is not Button btn || btn.Tag is not string courseId || Subject is null) return;
        var course = Subject.Courses.Find(c => c.Id == courseId);
        if (course is null || string.IsNullOrWhiteSpace(course.FilePath)) return;

        var path = course.FilePath;
        if (!path.StartsWith("file:", StringComparison.OrdinalIgnoreCase) && File.Exists(path))
        {
            path = new Uri(path).AbsoluteUri;
        }

        _ = await Launcher.LaunchUriAsync(new Uri(path));
    }
}
