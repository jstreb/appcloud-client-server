To take advantage of the configurations available to the tablet video view add the following configurations to the view in your manifest.json file. Additionally, you will have to provide the correct paths to the markup text and locales text files.

{
    "locales": "./tablet-videos/txt/locales/en.txt",
    "markup": "./tablet-videos/txt/markup/videos.txt",
    "data": [
        {
            "name": "videos",
            "contentConnector": "4e7c8f9e1f19987e1c003ec4",
            "type": "video_cloud"
        }
    ],
    "settings": [
        {
            "name": "embedCode",
            "type": "string",
            "value": "Paste your Brightcove player embed code here."
        },
        {
            "name": "titleOfPage",
            "type": "string",
            "value": "Playlists"
        },
        {
            "name": "aspectRatioOfPlaylistThumbnail",
            "type": "Number",
            "value": ".5625"
        }
    ],
    "styles": [
        {
            "name": "playlistThumbTitleColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "playlistThumbNumberOfVideosColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        },
        {
            "name": "selectedVideoBorderColor",
            "type": "color",
            "attribute": "border-color",
            "value": ""
        },
        {
            "name": "videoNameColor",
            "type": "color",
            "attribute": "color",
            "value": ""
        }
    ]
}