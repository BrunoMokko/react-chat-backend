import mongoose, { Schema, Document, Model } from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import { generatePasswordHash } from "../utils";
import differenceInMinutes from 'date-fns/difference_in_minutes'

export interface UserDoc extends Document {
    email: string;
    avatar: string;
    fullname: string;
    password: string;
    confirmed: boolean;
    confirmed_hash: string;
    last_seen: Date;
}

export interface UserModel extends Model<UserDoc> {}

const UserSchema = new Schema<UserDoc, UserModel>({
    email: {
        type: String,
        require: 'Email address is required',
        validate: [ isEmail, 'Invalid email' ],
        unique: true
    },
    fullname: {
        type: String,
        require: 'Fullname is required'
    },
    password: {
        type: String,
        require: 'Password is required'
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    confirmed_hash: String,
    avatar: String,
    last_seen: {
        type: Date,
        default: new Date(),
    },

}, { timestamps: true });

let isOnlineLogShown = false;

UserSchema.virtual("isOnline").get(function (this: any) {
    if (!isOnlineLogShown) {
        console.log(new Date(),this.last_seen,differenceInMinutes(new Date().toISOString(),new Date(this.last_seen)) < 1)
        isOnlineLogShown = true;
    }
    return differenceInMinutes(new Date().toISOString(),new Date(this.last_seen)) < 1;
});



UserSchema.set("toJSON", {
    virtuals: true,
});



UserSchema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('password')) return next();
    generatePasswordHash(user.password).then(hash => {
        user.password = String(hash);
        generatePasswordHash(+new Date() + "").then(confirmHash => {
            user.confirmed_hash = String(confirmHash);
            next();
        });
    }).catch(err => {
        next(err);
    });


});


const UserModel = mongoose.model<UserDoc, UserModel>('User', UserSchema);

export default UserModel;

