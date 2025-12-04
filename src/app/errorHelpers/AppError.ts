/* eslint-disable @typescript-eslint/no-unused-expressions */

class AppError extends Error{
    StatusCode:number;
    constructor(statusCode:number, message:string, stack=""){
        super(message);
        this.StatusCode=statusCode,
        this.stack=stack|| this.stack;
        if(stack ){
            this.stack=stack;

        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export default AppError;
