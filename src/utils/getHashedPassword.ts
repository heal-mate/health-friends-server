import bcrypt from "bcrypt";

//비밀번호 암호화 하기
const getHashedPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10); //바이트 단위의 임의의 문자열 salt생성
  const result = await bcrypt.hash(password, salt); //비밀번호 + salt로 암호화된 비밀번호 생성
  return result;
};

export default getHashedPassword;
