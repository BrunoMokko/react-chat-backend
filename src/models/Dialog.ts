import mongoose, { Schema, Document, Model } from 'mongoose';

export interface DialogDoc extends Document {
    author: {
        type: Schema.Types.ObjectId;
        ref: string;
        require: true;
    };
    partner: {
        type: Schema.Types.ObjectId;
        ref: string;
        require: true;
    };
    messages: {
        type: Schema.Types.ObjectId;
        ref: string;
    };
    lastMessage: {
        type: Schema.Types.ObjectId;
        ref: string;
    };

}

export interface DialogModel extends Model<DialogDoc> {}

const DialogSchema = new Schema<DialogDoc, DialogModel>({

    author: { type: Schema.Types.ObjectId, ref: 'User' },
    partner: { type: Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

const DialogModel = mongoose.model<DialogDoc, DialogModel>('Dialog', DialogSchema);

export default DialogModel;

