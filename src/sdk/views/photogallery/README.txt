To take advantage of the configurations available to the photogallery view add the following configurations to the view in your manifest.json file.  Additionally, you will have to provide the correct paths to the markup text and locales text files.

{
    "locales": "./photogallery/txt/locales/en.txt",
    "markup": "./photogallery/txt/markup/photogallery.txt",
    "data": [
        {
            "name": "photos",
            "contentFeed": "4dc2fe9f3012156411000236",
            "type": "feed",
            "configs": {
                "images": {
                    "type": "array",
                    "items": {
                        "media_thumbnail_url": {
                            "type": "image"
                        },
                        "media_content_url": {
                            "type": "image"
                        },
                        "media_description": {
                            "type": "String"
                        },
                        "media_title": {
                            "type": "String"
                        }
                    }
                }
            }
        }
    ],
    "settings": [
        {
            "name": "thumbnailsPerRow",
            "type": "string",
            "value": "3"
        },
        {
            "name": "aspectRatioOfThumbnails",
            "type": "string",
            "value": "1"
        }
    ],
    "styles": [
        {
            "name": "gridBackgroundColor",
            "type": "color",
            "attribute": "background-color",
            "value": ""
        },
        {
            "name": "sliderBackgroundColor",
            "type": "color",
            "attribute": "background-color",
            "value": ""
        },
        {
            "name": "descriptionTextColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        }
    ]
}