using Classify.WinUI.ViewModels;
using Classify.WinUI.Views;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Linq;

namespace Classify.WinUI;

public sealed partial class MainWindow : Window
{
    public MainViewModel ViewModel { get; } = new();

    public MainWindow()
    {
        this.InitializeComponent();
        ExtendsContentIntoTitleBar = true;
        SetTitleBar(null); 
        
        SystemBackdrop = new Microsoft.UI.Xaml.Media.MicaBackdrop();
        
        SubjectList.ItemsSource = ViewModel.Subjects;
    }

    private async void NavView_Loaded(object sender, RoutedEventArgs e)
    {
        await ViewModel.InitializeAsync();
        NavView.SelectedItem = NavView.MenuItems[0];
        ContentFrame.Navigate(typeof(HomePage), ViewModel);
    }

    private void NavView_ItemInvoked(NavigationView sender, NavigationViewItemInvokedEventArgs args)
    {
        if (args.IsSettingsInvoked)
        {
            ContentFrame.Navigate(typeof(SettingsPage), ViewModel);
            return;
        }

        var tag = args.InvokedItemContainer.Tag?.ToString();
        switch (tag)
        {
            case "home":
                ContentFrame.Navigate(typeof(HomePage), ViewModel);
                break;
            case "calendar":
                ContentFrame.Navigate(typeof(CalendarPage), ViewModel);
                break;
        }
    }

    private void SubjectList_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (SubjectList.SelectedItem is SubjectItemViewModel selected)
        {
            ContentFrame.Navigate(typeof(SubjectPage), new SubjectNavigationParameter 
            { 
                SubjectId = selected.Id, 
                ViewModel = ViewModel 
            });
        }
    }

    private void OnSubjectsHeaderClick(object sender, RoutedEventArgs e)
    {
        // Toggle list visibility maybe?
    }
}
