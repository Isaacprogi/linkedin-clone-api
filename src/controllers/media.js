const Media = require('../models/Media')

exports.getAll = async (req, res) => {
  try {
    const media = await Media.find()

    res.json(media)
  } catch (error) {
    res.status(400).json(error)
  }
}

//Bakendurl/public/vidoes/file_name.mp4

exports.create = async (req, res) => {
  const { name } = req.body;
  let videosPaths = [];


  if (Array.isArray(req.files.videos && req.files.videos.length > 0)) {
    for (let video of req.files.videos) {
      videosPaths.push('/' + video.path)
    }
  }

  try {
    const createMedia = await Media.create(
      {
        name,
        videos: videosPaths
      })

    res.jsson({
      message: 'Media created successfully', createMedia,
    })
  }

  catch (error) {
     res.status(400).json(error)
  }
}

exports.imageUpload = async(req,res)=>{
 res.status(200).json("File has been uploaded")
}
