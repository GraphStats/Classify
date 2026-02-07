using Classify.WinUI.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Linq;
using Windows.Foundation;
using System;

namespace Classify.WinUI.Views;

public sealed partial class CalendarPage : Page
{
    public MainViewModel? ViewModel { get; private set; }
    private DateTimeOffset _selectedDate = DateTimeOffset.Now.Date;

    public CalendarPage()
    {
        InitializeComponent();
    }

    protected override void OnNavigatedTo(NavigationEventArgs e)
    {
        base.OnNavigatedTo(e);
        ViewModel = e.Parameter as MainViewModel;
        Planner.SelectedDates.Add(_selectedDate);
        RefreshEvents();
    }

    private void RefreshEvents()
    {
        if (ViewModel is null) return;
        var list = ViewModel.RevisionEvents.Where(ev => ev.Date.Date == _selectedDate.Date).ToList();
        EventsList.ItemsSource = list;
    }

    private void OnSelectedDatesChanged(CalendarView sender, CalendarViewSelectedDatesChangedEventArgs args)
    {
        if (sender.SelectedDates.Count > 0)
        {
            _selectedDate = sender.SelectedDates[0];
            RefreshEvents();
        }
    }

    private async void OnAddEventClick(object sender, RoutedEventArgs e)
    {
        if (ViewModel is null) return;

        var titleBox = new TextBox { PlaceholderText = "Titre de la révision" };
        var subjectCombo = new ComboBox
        {
            ItemsSource = ViewModel.Subjects,
            DisplayMemberPath = "Name",
            SelectedIndex = ViewModel.Subjects.Count > 0 ? 0 : -1
        };

        var dialog = new ContentDialog
        {
            XamlRoot = this.XamlRoot,
            Title = "Nouvelle révision",
            PrimaryButtonText = "Ajouter",
            CloseButtonText = "Annuler",
            DefaultButton = ContentDialogButton.Primary,
            Content = new StackPanel
            {
                Spacing = 10,
                Children = { titleBox, subjectCombo }
            }
        };

        var result = await dialog.ShowAsync();
        if (result == ContentDialogResult.Primary && subjectCombo.SelectedItem is SubjectItemViewModel selected && !string.IsNullOrWhiteSpace(titleBox.Text))
        {
            await ViewModel.AddEventAsync(selected.Id, titleBox.Text.Trim(), _selectedDate.Date);
            RefreshEvents();
        }
    }

    private async void OnEventToggled(object sender, RoutedEventArgs e)
    {
        if (ViewModel is null) return;
        if (sender is ToggleSwitch toggle && toggle.DataContext is Models.RevisionEvent ev)
        {
            ev.Status = toggle.IsOn ? "done" : "pending";
            await ViewModel.SaveEventsAsync();
        }
    }
}
