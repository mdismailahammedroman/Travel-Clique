


import { Response } from 'express';

interface TMeta {
    page: number;
    limit: number;
    totalPage: number;
    total: number
}

interface ResponseData<T>{
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
    meta?: TMeta

}
export const sendResponse = <T>(res: Response, data: ResponseData<T>) => {
    res.status(data.statusCode).json({
       statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        meta: data.meta,
        data: data.data
    })
}