(function () {

    // source: https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_80x80_v1.png
    var ghost_image = chrome.extension.getURL("img/ghost_person_80x80_v1.png");
    // source: https://static-akam.licdn.com/sc/h/8seg2cwqjwoudeus3mbk7d9jo
    var topbar_image = chrome.extension.getURL('img/8seg2cwqjwoudeus3mbk7d9jo.png');

    var animation_duration = 0.5;

    var htmlentities = function (s) {
        // see http://stackoverflow.com/a/18750001/426266
        return s.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
           return '&#'+i.charCodeAt(0)+';';
        });
    }

    function isEmpty(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }
        return true && JSON.stringify(obj) === JSON.stringify({});
    }


    var url = window.location.href;
    // profile page?
    if (url.indexOf('/in/') !== -1) {
        profile_page(url);
    // contact list?
    } else if (url.indexOf('/connected/') !== -1) {
        contact_list(url);
    }


    function remove(event) {
        event.preventDefault();
        event.stopPropagation();
        var id = this.dataset.id;
        if (!id) {
            console.error('ID '+ id +' not found in DOM');
            return;
        }
        chrome.storage.local.remove(id, function() {
            // remove the box
            var box = document.querySelector('#local-contact-'+id);
            if (box) {
                // animate
                box.style.overflow = 'hidden';
                box.style.width = 0;
                // remove (but allow time to animate
                window.setTimeout(function () {
                    box.parentNode.removeChild(box);
                }, animation_duration*1000);
                console.log('Removed contact');
                // reduce the contact count by 1
                var numNode = document.querySelector('#num_contacts');
                if (numNode) {
                    var cnt = numNode.innerText - 1;
                    numNode.innerText = cnt < 0 ? 0 : cnt;
                }
            }
        });
    }

    // test if the stored image still resolves
    // see http://stackoverflow.com/a/9714891/426266
    function testImage(personid, url, timeout, callback) {
        timeout = timeout || 5000;
        var timedOut = false,
            timer;
        var img = new Image();
        img.onerror = img.onabort = function() {
            if (!timedOut) {
                clearTimeout(timer);
                callback(personid, url, "error");
            }
        };
        img.onload = function() {
            if (!timedOut) {
                clearTimeout(timer);
                callback(personid, url, "success");
            }
        };
        img.src = url;
        timer = setTimeout(function() {
            timedOut = true;
            callback(personid, url, "timeout");
        }, timeout);
    }

    function contact_list () {

// TODO:
// limit the initial query and add a more button


// TODO:
// better position for the list?












        chrome.storage.local.get(null, function(items) {
            if (!chrome.runtime.lastError && !isEmpty(items)) {

                var keys = Object.keys(items),
                    person,
                    header,
                    tpl,
                    numContacts = 0;


                tpl = '<div id="local-contacts" class="engagement-list" style="display: block;">';
                tpl += '<ul class="items clearfix" style="height: auto;">';

                var avatar = '';

                for (var i=0, s = keys.length; i < s; i++) {
                    numContacts++;

                    person = items[keys[i]];

                    // if the image is 404, it needs to be replaced
                    testImage(keys[i], person.image, 1000, function (personid, imgurl, result) {
                        if (result !== 'success') {
                            // replace the image
                            var pimg = document.querySelector('#local-contact-'+personid+' img');
                            if (pimg) {
                                pimg.src = ghost_image;
                            }
                        }
                    });

                    avatar = (person.image !== undefined ?
                          `<img src="${person.image}" height="150" width="150" alt="">`
                            :
                          `<img src="${ghost_image}" height="150" width="150" alt="">`
                    );

                    tpl += `<li id="local-contact-${keys[i]}" class="engagement-card with-dimiss-button customcard"
                         style="-moz-transition: width ${animation_duration}s
                        -ms-transition: width ${animation_duration}s;
                        -o-transition: width ${animation_duration}s;
                        -webkit-transition: width ${animation_duration}s;
                        transition: width ${animation_duration}s;">
                    <div class="engagement-body-left">
                     <a href="${person.url}" class="image">
                     ${avatar}
                     </a>
                    </div>
                    <div class="engagement-body-right">
                     <header class="header"><strong><a href="${person.url}">${person.name}</a></strong></header>
                     <p class="content">${person.position}</p>
                     <p class="content" style="margin-top:0.5em;padding-top:0">${person.location}</p>
                    </div>
                    <div class="engagement-action-container">
                     <div class="button-wrapper">
                      <span class="action-button custom"><span class="ok-sign-glyph"></span>Saved locally</span>
                      <div class="dismiss-button custom">
                        <a href="${person.url}" class="left"><span class="follow-glyph" role="presentation"></span>Connect</a>
                        <a href="javascript:undefined" data-id="${keys[i]}" class="removebutton right"><span class="dismiss-glyph" role="presentation"></span>Remove</a>
                      </div>
                     </div>
                    </div>
                    </li>`;
                }

                tpl += '</ul>';

                // TODO
                // pagination

                tpl += '<div class="more-bar-container" style="display: block;">';
                tpl += '  <div class="ruler"></div>';
                tpl += '  <div class="more-bar-wrapper" style="visibility: visible;">';
                tpl += '  </div>';
                tpl += '</div>';

                tpl += '</div>';



                header = `<div class="top-bar with-image">
                  <div class="header">
                    <div class="image-wrapper big-icon">
                      <img src="${topbar_image}" alt="" class="connected-icon">
                    </div>
                    <div class="left-entity">
                      <div class="content-wrapper">
                        <h1 class="name">Stored Contacts</h1>
                        <h3>You have <span id="num_contacts">${numContacts}</span> locally stored contacts.</h3>
                      </div>
                    </div>
                  </div>
                  <div class="header-dropdown">
                    <ul class="page-header-menu">
                      <li class="action-settings">
                        <a href="javascript:void(0)" class="btn btn-default" title="Remove all">
                        Remove all
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>`;


                var newdiv = document.createElement("div");
                newdiv.innerHTML = header + tpl;

                // insert the local connections into the page
                var listcontainer = document.querySelector('#contact-list-container');
                listcontainer.parentNode.insertBefore(newdiv, listcontainer);

                // events
                var removebuttons = document.querySelectorAll('.removebutton');
                for (var j = 0, t = removebuttons.length; j < t; j++) {
                    removebuttons[j].addEventListener('click', remove);
                }
            }
        });

    }


    function profile_page (url) {

        //check if this person is already a contact
        if (!document.querySelector('[data-action-name="add-to-network"]')) {
            console.info('Person is already a contact.');
            return; // abort
        }

        // store this info locally
        var person = {},
            tmp;

        var ul = document.querySelector('.profile-actions ul');
        var firstli = ul.querySelector('li');

        // don't store the url parameters
        if (url.indexOf("?") !== -1) {
            url = url.split("?")[0];
        }
        person.url = url;

        // slug == id (storage key)
        var id = url.split('/').pop();
        // the id may contain weird chars.
        // remove them.
        id = id.replace(/\W/g, '');
        console.log('id', id);

        // check if this person was already saved
        chrome.storage.local.get(id, function(item) {
            if (!chrome.runtime.lastError && !isEmpty(item)) {

                // user was found in local storage
                console.info('Already saved to contact list');

                var li = document.createElement("li");
                //var span = document.createElement("span");
                li.title = "Already saved";
                li.style.paddingTop = '10px';
                var a = document.createElement("a");
                a.innerHTML = "Saved"; // Stored
                a.href = 'https://www.linkedin.com/connections#local-contacts';
                a.title = 'Go to saved contacts';
                li.appendChild(a);
                ul.insertBefore(li, firstli);

            } else {

                // that user is not yet stored
                console.info('User available to store');

                try {

                    var li = document.createElement("li");
                    //var span = document.createElement("span");
                    li.style.cursor = 'pointer';
                    li.title = "Save contact locally";
                    //span.className = "public-profile";
                    li.style.paddingTop = '10px';
                    li.innerHTML = "Save";
                    //li.appendChild(span);
                    ul.insertBefore(li, firstli);

                    var save_click = function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        var btn = this;

                        // get the data
                        var img = document.querySelector('.profile-picture img');
                        if (img) {
                            person.image = img.src;
                            person.name = img.alt; // already htmlentitied
                        }
                        // profile did not have an image?
                        if (person.name === undefined) {
                            person.name = document.querySelector('.full-name').textContent;
                        }
                        tmp = document.querySelector('#headline .title');
                        if (tmp) {
                            person.position = htmlentities(tmp.innerHTML);
                        }
                        tmp = document.querySelector('#location [name="location"]');
                        if (tmp) {
                            person.location = htmlentities(tmp.innerHTML);
                        }
                        // console.log(person);

                        // now store the contact locally

                        // Save it using the Chrome extension storage API.
                        var stored_item = {};
                        stored_item[id] = person;
                        chrome.storage.local.set(stored_item, function() {
                            // Notify that we saved.
                            // message('Settings saved');
                            console.log('Contact stored');

                            // show success msg
                            btn.title = "Saved Contact";
                            btn.innerHTML = "Saved";
                            btn.style.cursor  = 'default';
                            // remove the event listener
                            li.removeEventListener('click', save_click);
                        });

                    }

                    li.addEventListener('click', save_click); //, false // false: execute in bubbling phase

                } catch (err) {
                    // did not find the button? That means it's either not there or the member is in the network already
                    // ignore
                    return;
                }


            }
        });


    }// profile_page()




    // TODO: Detect if member is logged in
    // or allow anybody to save contacts by adding a separate page???




})();