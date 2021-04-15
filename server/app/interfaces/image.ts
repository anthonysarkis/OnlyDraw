import { ObjectId } from 'bson';

export interface Image {
    name: string;
    tags: string[];
    encoding?: string;
    _id: ObjectId;
}
