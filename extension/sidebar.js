(function(chrome){
  var $ = new TinyQuery();
  
  document.addEventListener('DOMContentLoaded', selectionListener);
  
  chrome.devtools.panels.elements.onSelectionChanged.addListener(selectionListener);
  
  function selectionListener() {
    execute(classListToArray, [], updateClasses);
  }
  
  function classListToArray(element) {
    var classes = [];

    [].forEach.call(element.classList, function(_class){ classes.push(_class); });
    
    return classes;
  }
  
  function updateClasses(classes) {
    var classList = '<span class="empty">No classes</span>';
    
    if (classes.length) {
      classList = '<ul>';
      
      classes.forEach(function(className){
        classList += '<li><label><input type="checkbox" checked data-class="' + className + '"> ' + className + '</label></li>';
      });
      
      classList += '</ul>';
    }
    
    $('#classList').innerHTML = classList;
    
    $.each($('input'), function(element){
      element.addEventListener('change', function(){
        execute(toggleClass, [element.getAttribute('data-class'), element.checked]);
      });
    });
  }
  
  function toggleClass(element, className, checked) {
    element.classList.toggle(className, checked);
  }
  
  function TinyQuery() {
    var $ = function TinyQueryInstance(selector) {
      var elements = document.querySelectorAll(selector);
      
      return (elements.length === 1 ? elements[0] : elements);
    };
    
    $.each = function $each(arrayLike, callback) {
      [].forEach.call(arrayLike, callback);
    };
    
    return $;
  }
  
  function execute(fn, args, callback) {
    callback = callback || function(){};
    args = ['$0'].concat(args || []);
    
    args.forEach(function(item, index){
      if (index && typeof item === 'string') {
        args[index] = '\"' + item + '\"';
      }
    });
    
    return chrome.devtools.inspectedWindow.eval('(' + fn.toString() + ')(' + args.join() + ')', callback);
  }
})(chrome);