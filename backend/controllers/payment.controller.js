const svc = require('../services/payment.service');
const { sendSuccess } = require('../utils/response.utils');

exports.createOrder      = async (req,res,next) => { try { sendSuccess(res, await svc.createRazorpayOrder({...req.body,donorId:req.user?._id}),'Order created',201); } catch(e){next(e);} };
exports.verifyRazorpay   = async (req,res,next) => { try { sendSuccess(res, await svc.verifyRazorpay(req.body),'Payment verified');                                  } catch(e){next(e);} };
exports.razorpayWebhook  = async (req,res,next) => { try { res.json({ success:true, ...(await svc.handleRazorpayWebhook(req)) });                                    } catch(e){next(e);} };
exports.stripeWebhook    = async (req,res,next) => { try { res.json({ success:true, ...(await svc.handleStripeWebhook(req)) });                                      } catch(e){next(e);} };
