To take advantage of the configurations available to the blog with divider view add the following configurations to the view in your manifest.json file.  Additionally, you will have to provide the correct paths to the markup text and locales text files.

{
    "locales": "./blog-with-divider/txt/locales/en.txt",
    "markup": "./blog-with-divider/txt/markup/videos.txt",
    "data": [
        {
            "name": "news",
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
                        }
                    }
                }
            }
        }
    ],
    "settings": [
        {
            "name": "titleOfPage",
            "type": "string",
            "value": "News"
        }
    ],
    "styles": [
        {
            "name": "listItemTitleTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "listItemDateTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "listDetailTitleTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "listDetailPostTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        }
    ]
}