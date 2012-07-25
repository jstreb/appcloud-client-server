To take advantage of the configurations available to the tablet blog view add the following configurations to the view in your manifest.json file.  Additionally, you will have to provide the correct paths to the markup text and locales text files.

{
    "locales": "./tablet-blog/txt/locales/en.txt",
    "markup": "./tablet-blog/txt/markup/videos.txt",
    "data": [
        {
            "name": "blog",
            "contentFeed": "4dc300477414b322c5000429",
            "type": "feed",
            "configs": {
                "items": {
                    "type": "array",
                    "items": {
                        "title": {
                            "type": "text"
                        },
                        "description": {
                            "type": "text"
                        },
                        "pubDate": {
                            "type": "date"
                        },
                        "author": {
                            "type": "text"
                        }
                    }
                }
            }
        }
    ],
    "settings": [
        {
            "name": "title",
            "type": "string",
            "value": "Blog"
        }
    ],
    "styles": [
        {
            "name": "articleTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "headerTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "backgroundColor",
            "type": "color",
            "attribute": "background-color",
            "value": ""
        },
        {
            "name": "fullArticleTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "fullArticleHeaderTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "headerTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "fullArticleBackgroundColor",
            "type": "color",
            "attribute": "background-color",
            "value": ""
        },
        {
            "name": "fullArticleLinkTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "fullArticleBackgroundColor",
            "type": "color",
            "attribute": "background-color",
            "value": ""
        },
        {
            "name": "fullArticleAuthorTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "fullArticleDateTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        }
    ]
}