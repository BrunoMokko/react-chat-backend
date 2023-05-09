import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MessageDoc extends Document {
    text: {
        type: String;
        require: boolean;
    };
    unread: {
        type: boolean;
        default: boolean;
    };
    dialog: {
        type: Schema.Types.ObjectId;
        ref: string;
        require: true;
    };
    user: { type: Schema.Types.ObjectId, ref:"User", require: true };

}

export interface MessageModel extends Model<MessageDoc> {}

const MessageSchema = new Schema<MessageDoc, MessageModel>({

    text: { type: String, require: Boolean },
    unread: { type: Boolean, default: false },
    dialog: { type: Schema.Types.ObjectId, ref: 'Dialog', require: true },
    user: { type: Schema.Types.ObjectId, require: true },
}, { timestamps: true });

const MessageModel = mongoose.model<MessageDoc, MessageModel>('Message', MessageSchema);

export default MessageModel;

