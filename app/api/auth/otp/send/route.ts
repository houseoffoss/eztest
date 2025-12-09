import { NextResponse } from 'next/server';
import { otpController } from '@/backend/controllers/otp/controller';

export async function POST(request: Request) {
  try {
    const result = await otpController.sendOtp(request);
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in OTP send route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
