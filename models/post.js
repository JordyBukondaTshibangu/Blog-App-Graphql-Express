import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref : 'User',
      required: false,
      
    }
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
