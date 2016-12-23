(function () {

    // hook into the menu
    var navUL = document.querySelector('#network-sub-nav');
    if (navUL) {
        var new_list_item = document.createElement("li");
        new_list_item.style.cursor = 'pointer';
        new_list_item.innerHTML = '<a href="/connections#local-contacts">Saved Contacts</a>';
        navUL.insertBefore(new_list_item, navUL.querySelector('li'));
    }

})();