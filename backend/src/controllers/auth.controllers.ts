import { userModel } from "../models/user.models";
import { comparePassword, hashPassword } from "../services/hash.services";
import { generateUserToken } from "../services/tokens.services";
import { asyncHandler } from "../utils/asyncHandler";
import { cookieOptions } from "../utils/cookieOption";
import { loginUserSchema, registerUserSchema } from "../validations/authSchema.validations";

export const registerUser = asyncHandler(async (req, res) => {

  const result = await registerUserSchema.safeParseAsync(req.body);

  if (!result.success) {
    res.status(400).json({
      errors: result.error.format(),
    });
    return;
  }

  const { fullName, email, password } = result.data;

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    res.status(409).json({
      message: "User already exists",
    });
    return;
  }

  const hashedPassword = await hashPassword(password);

  const user = await userModel.create({
    fullName,
    email,
    password: hashedPassword,
  });

  const token = generateUserToken(String(user._id));

  res.cookie("token", token, cookieOptions).status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
});


export const loginUser = asyncHandler(async(req,res)=>{
    const result = await loginUserSchema.safeParseAsync(req.body);

    if (!result.success) {
        res.status(400).json({
        errors: result.error.format(),
        });
        return;
    }

    const {email, password } = result.data;

    const user = await userModel.findOne({email});

    if(!user){
        res.status(400).json({
            message: "User doesn't exists"
        })
        return;
    }

    const isPasswordCorrect = await comparePassword(password, user.password as string);
    if(!isPasswordCorrect ){
        res.status(401).json({
            message: "Invalid credentials"
        })
        
        return;
    }

    const token = generateUserToken(String(user._id));

    res.cookie('token', token, cookieOptions).status(200).json({
        message: "User logged in successfully",
        user: {
            email: user.email,
            id: user._id,
            fullName: user.fullName
        }
    })  
})

export const userProfile = asyncHandler(async(req, res)=>{
    const user = await userModel.findById(req.user?._id).select("-password");

    if (!user) {
        res.status(404).json({
            message: "User not found"
        });
        return;
    }

    res.status(200).json({
        user:{
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    })

})

export const logoutUser = asyncHandler(async(req, res)=>{
    res.clearCookie("token").status(200).json({
        message: "User logged out successfully"
    })
})