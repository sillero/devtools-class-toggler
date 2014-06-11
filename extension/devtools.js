(function(chrome){
  chrome.devtools.panels.elements.createSidebarPane('Classes', sidebarPane);
  
  function sidebarPane(sidebar) {
    sidebar.setPage('sidebar.html');
  }
})(chrome);