const validator = (req,res,next) => {
    let productDetails = req.body;
    if(!productDetails.name || !productDetails.price || !productDetails.description){
        return res.status(400).json({error: 'Missing required field(s)'});
    }
    if(typeof productDetails.name !== 'string' || typeof productDetails.description !== 'string'){
        return res.status(400).json({error: 'Name and Description must be strings'});
    }   

    if(typeof productDetails.price !== 'number' || productDetails.price <= 0){
        return res.status(400).json({error: 'Price must be a positive number'});
    };
    next();

}
module.exports = validator;