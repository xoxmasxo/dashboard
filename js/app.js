const code = {
    data() {
        return {
            // * toggle menu
            showMenu: false,
            // * count income lines
            incomeLinksNumber: 0,
            // * count & render completed links
            outcomeLinksNumber: 0,
            outcomeLinks: [],
            // * code templates
            templates: [
                '<script src="https://static.production.almightypush.com/mng/subs_window.js?ver=1623419035"></script>\n<link rel="stylesheet" type="text/css" href="https://static.production.almightypush.com/mng/subs_window.css?ver=1623419035">\n\n<script src="https://static.production.almightypush.com/mng/channels/init.min.js?ver=1623419035"></script>\n<script>\nif (window.initSubscriber) {\n    const snippetId = \'PLACE_YOUR_DATA_HERE\';\n    const subscriber = window.initSubscriber(snippetId);\n    subscriber.ready();\n}\n</script>',
                '<script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async=""></script>\n<script>\nvar OneSignal = window.OneSignal || [];\nOneSignal.push(function() {\n    OneSignal.init({\n        appId: "PLACE_YOUR_DATA_HERE",\n    });\n});\n</script>',
                '<script type="text/javascript" src="js/backoffer.js"></script>\n<script type="text/javascript">\n(function (w) {\n    w.backOfferUrl = \'PLACE_YOUR_DATA_HERE\'\n}(window));\n</script>'
            ],
            lineToReplace: 'PLACE_YOUR_DATA_HERE',
            darkTheme: false,
        }
    },
    methods: {
        // * resize texarea on input
        resizeArea(e) {
            e.target.style.height = "auto";
            e.target.style.height = (e.target.scrollHeight) + "px";
        },
        // * count input links
        countLines(e) {
            const n = e.target.value;
            const n_all = n.split('\n').length;
            let empty_in = empty_out = 0;

            switch (e.target.dataset.type) {
                case 'in':
                    n.split('\n').forEach(el => {
                        el === '' ? empty_in++ : '';
                    });
                    !n ? this.incomeLinksNumber = 0 : this.incomeLinksNumber = n_all - empty_in;
                    break;
                case 'out':
                    n.split('\n').forEach(el => {
                        el === '' ? empty_out++ : '';
                    });
                    !n ? this.outcomeLinksNumber = 0 : this.outcomeLinksNumber = n_all - empty_out;
                    break;
            }
        },
        // * count & generate completed links
        generateCompletedLinks(e) {
            this.outcomeLinks = [];

            e.target.value.split('\n').forEach(el => {
                this.outcomeLinks.push(el);
            });
        },
        // * generate php tag from curly brackets
        generatePHPTag(e) {
            const regexp = /(?<=.)({.+?})/g;
            const params = Array.from(e.target.value.matchAll(regexp));

            params.forEach(el => {
                e.target.value = e.target.value.replace(el[0], '<?php echo $_GET[\'' + el[0].slice(1).slice(0, -1) + '\']; ?>');
            });
            // * show popup if params was here
            params.length ? this.showNotify('Link URL replaced', 'success') : '';
        },
        // * add new block for script
        addNewScriptBlock(e) {
            // TODO: зробити додавання нового блоку
            this.showNotify('Under development');
        },
        // * replase double quotes in textarea
        replaceDoubleQuotes(e) {
            const value = e.target.value;
            const regexp = /""/g;
            const onesignal = value.toLowerCase().search('async') !== -1 ? 1 : 0;

            if (!onesignal && e.target.value.search(regexp) !== -1) {
                e.target.value = value.replace(regexp, '"')
                this.showNotify('Doubled quotes replaced', 'success');
            }
        },
        // * add code template to textarea
        addCodeTemplate(e) {
            e.preventDefault();

            const textarea = e.target.parentNode.firstChild;
            textarea.value = this.templates[+e.target.dataset.template];
            // * need to resize textarea
            textarea.style.height = "auto";
            textarea.style.height = (textarea.scrollHeight) + "px";
            textarea.focus();
            // * select phrase to replace
            const sub = this.lineToReplace;
            const sp = textarea.value.indexOf(sub);
            const ep = sp + sub.length;
            this.stringToReplase(textarea, sp, ep);
            this.showNotify('Tepmlate #' + (+e.target.dataset.template + 1) + ' added', 'success');
        },
        // * select phrase to replace function
        stringToReplase(el, start, end) {
            if (el.createTextRange) {
                tr = el.createTextRange();
                tr.move("character", start);
                tr.moveEnd("character", end - start);
                tr.select();
            } else if (el.setSelectionRange) {
                el.setSelectionRange(start, end);
            }
        },
        // * copy value from input
        copyValue(e) {
            e.preventDefault();

            const str = e.target.previousSibling.value;
            if (str) {
                navigator.clipboard.writeText(str)
                    .then(() => {
                        this.showNotify('Copied', 'success');
                        console.info('Copied:\n' + str);
                    })
                    .catch((err) => {
                        this.showNotify('Error: ' + err.message, 'error');
                        console.error('Error:\n' + err.message);
                    });
            } else {
                this.showNotify('Empty input, nothing to copy');
                console.info('Empty input, nothing to copy')
            }
        },
        // * generate results links
        generateLinks(e) {
            e.preventDefault();
            let links = e.target.previousSibling.value;
            let newDomain = document.querySelector('#inp_2_1').value;
            let result = '';

            if (!links.length) {
                this.showNotify('Empty input, nothing to generate');
                return;
            }

            if (!newDomain.length) {
                this.showNotify('New domain needeed');
                return;
            }

            let str = links.split('\n');
            this.removeEmptyString(str, '');

            str = str.map(item => {
                item = new URL(item);
                return item.pathname[item.pathname.length - 1] === '/' ? (item.pathname).slice(0, -1) : item.pathname;
            });

            const names = str.map(item => {
                item = item.split('/');
                return item[item.length - 1]
            });

            result = names.map(item => {
                return newDomain + item + '/\n';
            });

            const area = document.querySelector('#inp_4_1');
            result.forEach((item, index) => {
                area.value += item;
                index === (result.length - 1) ? area.value += '\n' : '';
            });

            area.style.height = "auto";
            area.style.height = (area.scrollHeight) + "px";

            this.showNotify('Links to completed jumps generated', 'success')
            setTimeout(() => {
                this.showNotify('Don`t forget to check it');
            }, 1000);
        },
        // * remove empty string from array
        removeEmptyString(arr, value) {
            var i = 0;
            while (i < arr.length) {
                if (arr[i] === value) {
                    arr.splice(i, 1);
                } else {
                    ++i;
                }
            }
            return arr;
        },
        // * add slash to new domain if isn`t exist
        addSlashToDomain(e) {
            let value = e.target.value;
            e.target.value = (value[value.length - 1] !== '/' && value.length) ? value + '/' : value;
        },
        // * open link with worker url
        openWorkerLink(e) {
            e.preventDefault();
            const url = e.target.previousSibling.value;
            url ? window.open(url, '_blank') : this.showNotify('Empty URL');
        },
        // * creates notify on corner
        showNotify(msg, type) {
            const div = document.createElement('div');

            switch (type) {
                case 'success':
                    div.classList.add('notify__item', 'notify__item-success');
                    break;
                case 'error':
                    div.classList.add('notify__item', 'notify__item-error');
                    break;
                default:
                    div.classList.add('notify__item');
                    break;
            }

            const p = document.createElement('p');
            p.textContent = msg;
            div.appendChild(p);

            const popup = document.querySelector('.notify');
            popup.insertAdjacentElement("beforeend", div);

            setTimeout(() => popup.firstChild.style.transform = 'translateX(120%)', 2500);
            setTimeout(() => popup.removeChild(div), 2800);

        },
        // * open & close modal functions
        showModal(e, id) {
            e.preventDefault();

            document.querySelector('#modal_' + id).style.display = 'block';
            document.body.style.overflow = 'hidden';
        },
        closeModal(id) {
            document.querySelector('#modal_' + id).style.display = 'none';
            document.body.style.removeProperty('overflow');
        },
        // * save templates to array & localStorage
        saveModalData() {
            const area = document.querySelectorAll('.modal__content textarea');
            area.forEach((el, index) => {
                this.templates[index] = el.value;
                localStorage.setItem('temp_' + index, el.value);
            });

            this.showNotify('Templates saved', 'success');
        },
        // * load data to array from localStorage (if it exists)
        loadLocalStorageData() {

            // * code templates
            this.templates.forEach((el, index) => {
                let v = 'temp_' + index;
                localStorage[v] ? this.templates[index] = localStorage[v] : '';
            });
        },
        // * clear data from inputs
        clearForm(e) {
            e.preventDefault();

            let decide = confirm('Are you sure you want to clear data?');
            if (decide) {
                document.querySelector('form[name="page"]').reset();
                this.outcomeLinks = [];
                this.incomeLinksNumber = this.outcomeLinksNumber = 0;
                this.showNotify('Data cleared', 'success');
            }
        }
    },
    beforeMount() {
        // load data from localStorage
        this.loadLocalStorageData(),
            // confirm before leave
            window.onbeforeunload = function(e) {
                return 'Unsaved data may be lost. Close tab?'
            };
    }
}

const app = Vue.createApp(code);
const vm = app.mount('#app');