import { getServerSession } from "next-auth"
import { authOptions } from "./auth/config"

export { authOptions }
export const auth = () => getServerSession(authOptions)