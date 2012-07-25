The tablet photo gallery view is slightly different then other views in that it simply overrides some of the functions in the smaller device version of the photogallery.  To use the tablet version of the photogallery you should include the photogallery.js and photogallery.css found in the ./source/views/photogallery/ along with the photogallery.js and photogallery.css found in ./source/views/tablet-photogallery/ To take advantage of the configurations available to the photogallery view add the following configurations to the view in your manifest.json file.  Additionally, you will have to provide the correct paths to the markup text and locales text files.

{
    "locales": "./tablet-photogallery/txt/locales/en.txt",
    "markup": "./tablet-photogallery/txt/markup/videos.txt",
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