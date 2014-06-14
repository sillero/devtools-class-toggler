;(function(chrome, panels, inspectedWindow, $, undefined){
  /*
    Dom mutation events needs to be properly treated for this extension to grow
  */
  var app = create();
  
  app.initialize();
  
  /* Actions */
  
  function create() {
    //app.log('initialize');
    
    return {
      $classList: $('#classList'),
      $attributeList: $('#attributeList'),
      $stateList: $('#stateList'),
      log: function(){ execute(REMOTE$consoleLog, arguments); },
      error: function(){ execute(REMOTE$consoleError, arguments); },
      debug: function(){ execute(REMOTE$consoleDebug, arguments); },
      initialize: function(){
        bindLists();
        onSelectionChanged();
        panels.elements.onSelectionChanged.addListener(onSelectionChanged);
        execute(REMOTE$bindAttributeChange);
      }
    };
  }
  
  function onSelectionChanged() {
    execute(REMOTE$fetchElement, [], updateLists);
  }
  
  function updateClasses() {
    execute(REMOTE$fetchElement, [], function(element){ updateClassList(element.classes); });
  }
  
  function updateStates() {
    execute(REMOTE$fetchElement, [], function(element){ updateStateList(element.states); });
  }
  
  function updateAttributes() {
    execute(REMOTE$fetchElement, [], function(element){ updateAttributeList(element.attributes); });
  }
  
  /*
  
    BIND LISTS
  
  */
 
  function bindLists() {
    bindClassList();
    bindStateList();
    bindAttributeList();
  }
  
  function bindClassList() {
    app.$classList
      .on('click', '.add', addItemClassList)
      .on('change', 'input[type="checkbox"]', function(){
        execute(REMOTE$toggleClass, [this.getAttribute('data-name'), this.checked]);
      });
  }
  
  function bindStateList() {
    app.$stateList
      .on('change', 'input', function(){
        execute(REMOTE$toggleState, [this.getAttribute('data-name'), this.checked]);
      });
  }
  
  function bindAttributeList() {
    app.$attributeList
      .on('click', '.add', addItemAttributeList)
      .on('change', 'input', function(){
        var $item = $(this).closest('li');
        var $checkbox = $item.find('input[type="checkbox"]');
        var $input = $item.find('input[type="text"]');
        var attributeName = $checkbox.attr('data-name');
        
        execute(REMOTE$toggleAttribute, [attributeName, $checkbox[0].checked, $input.val()]);
        
        if (attributeName === 'class') {
          updateClasses();
        }
        if ({selected:1, checked:1}[attributeName]) {
          updateStates();
        }
      });
  }
  
  /*
  
    ADD ITEM TO LIST
    
  */
  
  function addItemClassList() {
    var $newClass = $('<li><input type="text"></li>');
  
    $newClass
      .on('blur change', 'input', function(){
        if (this.value) {
          execute(REMOTE$toggleClass, [this.value, true]);
          updateClasses();
        }
        else {
          $newClass.remove();
        }
        app.$classList.removeClass('edit');
      })
      .on('keydown', 'input', function(e){
        if (e.keyCode === 32) {
          e.preventDefault();
        }
      });
    
    app.$classList
      .addClass('edit')
      .find('.list')
      .append($newClass);
    
    $newClass.find('input').focus();
  }
  
  function addItemAttributeList() {
    var $newAttribute = $('<li><input type="text"></li>');
  
    $newAttribute
      .on('blur change', 'input', function(){
        if (this.value) {
          execute(REMOTE$toggleAttribute, [this.value, true, '']);
          updateAttributes();
        }
        else {
          $newAttribute.remove();
        }
        app.$attributeList.removeClass('edit');
      });
    
    app.$attributeList
      .addClass('edit')
      .find('.list')
      .append($newAttribute);
    
    $newAttribute.find('input').focus();
  }
  /*
  
    UPDATE LISTS
  
  */
  
  function updateLists(element) {
    updateClassList(element.classes);
    updateAttributeList(element.attributes);
    updateStateList(element.states);
  }
  
  function updateClassList(classes) {
    var html = '<li class="empty">No classes</li>';
    
    if (classes.length) {
      html = '';
      
      classes.forEach(function(className){
        html += '<li><label><input type="checkbox" checked data-name="' + className + '"> .' + className + '</label></li>';
      });
    }
    
    app.$classList.find('.list').html(html);
  }
  
  function updateStateList(states) {
    var html = '';
    
    if (states.length) {
      html = '<h2>State</h2><ul class="list">';
      
      states.forEach(function(state){
        html += '<li><label><input type="checkbox" ' + (state.value ? 'checked' : '') + ' data-name="' + state.name + '"> ' + state.name + '</label></li>';
      });
      
      html += '</ul>';
    }
    
    app.$stateList.html(html);
  }
  
  function updateAttributeList(attributes) {
    var html = '<li class="empty">No Attributes</li>';
    
    if (attributes.length) {
      html = '';
      
      attributes.forEach(function(attribute){
        html += '<li><label><input type="checkbox" checked data-name="' + attribute.name + '" data-value="' + attribute.value + '"> ' + attribute.name + '</label><input type="text" value="' + attribute.value + '"></li>';
      });
    }
    
    app.$attributeList.find('.list').html(html);
  }
  
  function execute(fn, args, callback) {
    callback = callback || function(){};
    args = ['$0'].concat(args || []);
    
    args.forEach(function(item, index){
      if (index && typeof item === 'string') {
        args[index] = '\"' + item + '\"';
      }
    });
    
    return inspectedWindow.eval('(' + fn.toString() + ')(' + args.join() + ')', callback);
  }
  
  /* REMOTE */
  
  function REMOTE$consoleLog() {
    //console.log.apply(console, [].slice.call(arguments, 1));
    console.log(arguments);
  }
  function REMOTE$consoleDebug() {
    //console.debug.apply(console, [].slice.call(arguments, 1));
  }
  function REMOTE$consoleError() {
    //console.error.apply(console, [].slice.call(arguments, 1));
  }
  
  function REMOTE$fetchElement($0) {
    var element = {
      classes: [],
      attributes: [],
      states: []
    };

    if ({checkbox: 1, radio:1}[$0.type]) {
      element.states.push({ name: 'checked',  value: $0.checked });
    }
    if ($0.tagName === 'OPTION') {
      element.states.push({ name: 'selected',  value: $0.selected });
    }
    
    [].forEach.call($0.classList, function(_class){
      element.classes.push(_class);
    });
    
    [].forEach.call($0.attributes, function(_attribute){
      element.attributes.push({ name: _attribute.name, value: _attribute.value });
    });
    
    return element;
  }
  
  function REMOTE$toggleClass(element, name, active) {
    element.classList.toggle(name, active);
  }
  
  function REMOTE$toggleState(element, name, active) {
    element[name] = active;
  }
  
  function REMOTE$toggleAttribute(element, name, active, value) {
    if (!active) {
      element.removeAttribute(name);
    }
    else {
      element.setAttribute(name, value);
    }
  }
  
  function REMOTE$bindAttributeChange(element) {
    var callback = function(e){
      //find how to trigger a reaction from inspectedWindow into
      //the extension to update the panel
      //alert('mutated');
    };
    var mutation = new MutationObserver(callback);
    
    mutation.observe(document, { attributes: true, subtree: true });
  }
})(chrome, chrome.devtools.panels, chrome.devtools.inspectedWindow, Zepto);