using Classify.WinUI.ViewModels;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Threading.Tasks;

namespace Classify.WinUI;

public sealed partial class MainWindow : Window
{
    public MainViewModel ViewModel => (MainViewModel)DataContext;

    public MainWindow()
    {
        InitializeComponent();
        // Loaded += OnLoaded;
    }

    // Commented out all logic to isolate build issue
    /*
    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        await ViewModel.InitializeAsync();
        ViewModel.PropertyChanged += OnViewModelPropertyChanged;
        ViewModel.Subjects.CollectionChanged += OnSubjectsChanged;
        RefreshSubjects();
        ApplyTheme(ViewModel.Settings.Theme);
        ShellNav.SelectedItem = ShellNav.MenuItems[0];
        NavigateTo("home");
    }
    
    // ... rest of the file ...
    */
}
