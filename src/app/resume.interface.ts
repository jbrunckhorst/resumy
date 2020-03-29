import { icon, findIconDefinition, IconName } from '@fortawesome/fontawesome-svg-core';

export class Profile {
    public name: string;
    public photo: string;
    public adress: string;
    public phone: string;
    public email: string;
    public references = [];
    public languages = [];

    constructor(data: {name: string, photo: string, adress: string, phone: string, email: string,
                       references: string[], languages: string[]}) {
        this.name = data.name;
        this.photo = data.photo;
        this.adress = data.adress.replace(/, /g, '<br>');
        this.phone = data.phone;
        this.email = data.email;
        data.references.forEach(url => {
            this.references.push(new Reference(url));
        });
        data.languages.forEach(language => {
            this.languages.push(language);
        });
    }
}

export class Reference {
    public icon: any;
    public url: string;
    public shortUrl: string;

    constructor(url: string) {
        this.url = url;
        this.shortUrl = url.replace('http://', '').replace('https://', '').replace('www.', '');
        this.icon = icon(findIconDefinition({prefix: 'fab', iconName: this.shortUrl.split('.')[0] as IconName}));
    }

}

export class Section {
    public id: string;
    public title: string;
    public icon: string;

    constructor(id: string, data) {
        this.id = id;
        this.icon = data.icon;
        this.title = data.title;
    }
}

export class Experience {
    public id: string;
    public section: string;
    public title: string;
    public subtitle?: string;
    public startDate: Date;
    public endDate?: Date;
    public today: boolean;
    public description: string[];

    constructor(id: string, section: string, data) {
        this.id = id;
        this.section = section;
        this.title = data.title;
        this.subtitle = data.subtitle;
        if (data.startDate instanceof Date) {
            this.startDate = data.startDate;
        } else {
            this.startDate = data.startDate.toDate();
        }
        if (data.endDate instanceof Date) {
            this.endDate = data.endDate;
        } else {
            this.endDate = data.endDate.toDate();
        }
        this.today = data.today;
        this.description = data.description.filter(x => /\S/.test(x));
    }
}
