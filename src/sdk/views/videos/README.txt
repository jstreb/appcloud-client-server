To take advantage of the configurations available to the video view add the following configurations to the view in your manifest.json file.  Additionally, you will have to provide the correct paths to the markup text and locales text files.

Japanese customers only: To use this view, with a Japanese Video Cloud account, you will need to modify the BRIGHTCOVE_EXPERIENCE_URL property in the videos.js file to point to the "admin.brightcove.co.jp"" domain rather than "admin.brightcove.com".


{
    "locales": "./videos/txt/locales/en.txt",
    "markup": "./videos/txt/markup/videos.txt",
    "data": [
        {
            "name": "videos",
            "contentConnector": "4e4bd2231f1998155f000714",
            "type": "video_cloud"
        }
    ],
    "settings": [
        {
            "name": "embedCode",
            "type": "string",
            "value": "Paste your Brightcove player embed code here."
        }
    ],
    "styles": [
        {
            "name": "playlistTitleColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "videoTitleColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "videoDescriptionColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "detailTitleColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "detailDescriptionColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "cellBackgroundColor",
            "type": "color",
            "attribute": "background-color",
            "value": ""
        }
    ]
}