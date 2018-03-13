import * as $ from 'jquery';
import './styles.scss';
import {Options, Section, SectionItem} from "./models";


let model: Section[];
let placeholder: string;
let callback: Function;
let commonTemplate = function (scrollSize) {
    let scrollSizeStyle = scrollSize ? `style="overflow-y:auto;max-height:${scrollSize}px"` : '';
    return `
        <div class='section-selection flex'>
            <div class='js-sections-html-placeholder' ${scrollSizeStyle}></div>
            <div ${scrollSizeStyle}>
                <div class='section-row js-items-html-placeholder'></div>
            </div>
        </div>
    `;
};
//
let sectionTemplate = function (data: Section) {
    return `
        <div class='section pointer js-section${data.active ? ' active' : ''}${data.disabled ? ' disabled' : ''}'>
            <div class="flex checkbox">
                <input class="js-section-all" ${data.disabled ? 'disabled' : ''} type='checkbox' id='${data.id}' ${data.checked ? 'checked' : ''}/>
                <label class="section-name pointer" for="${data.id}">${data.name}</label>
                <i class='section-chevron fas fa-angle-right pull-right'></i>
            </div>
            <div class="section-mini">Выбрано: ${data.count} из ${data.total}</div>
        </div>
    `;
};

let itemTemplate = function (data: SectionItem) {
    return `
        <div class='col-xs-12 col-sm-6 section-col'>
            <label class='section-item pointer ' for='${data.id}'>
                <p><i class='section-icon fas ${data.icon}'></i></p>
                <input class="js-section-item" type='checkbox' ${data.disabled ? 'disabled' : ''} id='${data.id}' ${data.checked ? 'checked' : ''}/> ${data.name}
            </label>
        </div>
    `;
};

let labelItemsTemplate = function () {
    return `<div class="col-xs-12 section-title"><b>Включить в отчет следующие разделы:</b></div>`
};

let labelEmptyTemplate = function (data: string) {
    return `<div class="col-xs-12 section-title"><b>Включить в отчет раздел "${data}"</b></div>`
};

//ренедрит содержимое commonTemplate, т.к. шаблоны sectionTemplate и itemTemplate
function render(model: Section[]) {
    let $body = $('body');
    let sectionsHtml = model.map(section => sectionTemplate(section)).join('');
    let itemsHtml = model.filter(section => section.active).map(section => {
        //заголовок правой секции выбирается в зависимости от наличия и кол-ва items.
        let labelHtml = section.items ? labelItemsTemplate() : labelEmptyTemplate(section.name);

        let itemsHtml = section.items ? section.items.map(item => itemTemplate(item)).join('') : '';

        //клеим его перед списком items-ов
        return labelHtml + itemsHtml
    }).join('');

    $body.find('.js-sections-html-placeholder').html(sectionsHtml);
    $body.find('.js-items-html-placeholder').html(itemsHtml);
}

//рендерит два столбика, левый для sections, правый для items
function renderCommon(scrollSize: number) {
    let $body = $('body');
    let html = commonTemplate(scrollSize);
    $body.find(placeholder).html(html);
}

function init(_placeholder: string, _model: Section[], options: Options) {

    callback = options.callback || function () {
    };
    placeholder = _placeholder;
    let modelTemp = Array.from(_model);
    model = modelTemp.filter(m => !!m.items);
    let noItems = modelTemp.filter(m => !m.items);
    if (noItems) {
        let items: SectionItem[] = noItems.map(i => {
            return {
                id: i.id,
                name: i.name,
                icon: 'fa-book',
                checked: i.checked,
                disabled: i.disabled,
            };
        });
        let section: Section = {id: 'help', name: 'Справочная информация', total: items.length, items: items, disabled: false, checked: items.filter(item => item.checked).length > 0};
        model.push(section)
    }
    //сервер не инициализирует поля count, active и cheched, надо самостоятельно это сделать.
    model.forEach((m, i) => {
        m.count = m.items ? m.items.filter(item => item.checked).length : 1;
        m.active = i == 0;
        m.total = m.items ? m.items.length : 1;
    });

    renderCommon(options.scrollSize);

    render(model);
    let $body = $('body');
    //обработчик клика по блоку section, раскрывает список items-ов
    $body.on('click', '.js-section', function (e) {
        //console.log('Выделение секции');
        let isInput = $(e.target).hasClass('js-section-all');
        let isActive = $(e.currentTarget).hasClass('active');
        if (!(isInput || isActive)) {
            e.preventDefault();
            e.stopPropagation();
        }
        let $this = $(this);
        setTimeout(function () {
            let id = $this.find('input').attr('id');
            if (id) { //ie11 почему-то второй раз пуляет и не находит id
                model.forEach(section => section.active = (section.id == id));
                render(model);
            }
        }, 0);
    });

    //обработчик клика по правому item-чекбоксу
    $body.on('change', '.js-section-item', function (e) {
        //e.stopPropagation();
        let $input = $(this),
            isChecked = $input.is(':checked'),
            activeItemId = $input.attr('id');

        let section = model.find(section => section.active);
        section.items.find(item => item.id == activeItemId).checked = isChecked;
        section.count = section.items.filter(item => item.checked).length;
        section.checked = section.count > 0;

        render(model);
        itemsToSection();
        //callback(model);
    });

    //Обработчик клика по левому section-чекбоксу, который выбирает все правые items-чекбоксы
    $body.on('change', '.js-section-all', function (e) {
        //console.log('Выбор секции');
        e.stopPropagation();

        let $input = $(this),
            id = $input.attr('id'),
            isChecked = $input.is(':checked');

        let section = model.find(section => section.id == id);
        if (section.items)
            section.items.forEach(item => item.checked = isChecked);
        section.count = isChecked ? (section.items ? section.items.length : 1) : 0; //Если нет items то пишем "выбрано: 1"
        section.checked = section.count > 0;

        render(model);
        itemsToSection();
        //callback(model);

    });


}

function disable() {
    if (model) {
        model.forEach(section => {
            section.disabled = true;
            if (section.items && section.items.length)
                section.items.forEach(item => item.disabled = true);
        });
        render(model);
        itemsToSection();
    }
    //callback(model);
}

function enable() {
    if (model) {
        model.forEach(section => {
            section.disabled = false;
            if (section.items && section.items.length)
                section.items.forEach(item => item.disabled = false);
        });
        render(model);
        itemsToSection();
    }
}

function itemsToSection() {
    let result;
    let help = model.find(m => m.id == 'help');
    if (help && help.items) {
        result = model.concat(help.items.map(i => {
            return {
                id: i.id,
                name: i.name,
                active: true,
                checked: i.checked,
                count: 1,
                total: 1,
                disabled: i.disabled
            }
        }))
    } else {
        result = model.slice();
    }
    callback(result.filter(m => m.id != 'help'));
}

export {init, disable, enable};