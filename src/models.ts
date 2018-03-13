export interface Section {
    id: string;
    name: string;
    active?: boolean;
    checked?: boolean;
    count?: number;
    total: number;
    disabled: boolean;
    items?: SectionItem[]
}

export interface SectionItem {
    id: string;
    name: string;
    icon: string;
    checked: boolean;
    disabled: boolean;
}

export interface CommonTemplate {
    sectionsHtml: string;
    itemsHtml: string;
    scrollSize: number;
}

export interface Options {
    callback: Function;
    disable: Function;
    iconsMap: object[];
    scrollSize: number;
}
