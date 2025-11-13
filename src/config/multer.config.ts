import { diskStorage } from 'multer';
import { extname } from 'path';

const genarateRandomName = (file: Express.Multer.File): string => {
  const randomName = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return `${file.fieldname}-${randomName}${extname(file.originalname)}`;
};

// for file upload
export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename(req, file, callback) {
      callback(null, genarateRandomName(file));
    },
  }),

  // filtr file type
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
};
