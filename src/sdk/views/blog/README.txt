To take advantage of the configurations available to the blog view add the following configurations to the blog view in your manifest.json file.  Additionally, you will have to provide the correct paths to the markup text and locales text files.

{
    "locales": "./blog/txt/locales/en.txt",
    "markup": "./blog/txt/markup/blog.txt",
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
            "value": "Blog"
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