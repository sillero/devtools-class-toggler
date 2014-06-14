(function(chrome){
  chrome.devtools.panels.elements.createSidebarPane('Classes & Attributes', sidebarPane);
  
  function sidebarPane(sidebar) {
    sidebar.setPage('sidebar.html');
    sidebar.setHeight('25em');
  }
})(chrome);