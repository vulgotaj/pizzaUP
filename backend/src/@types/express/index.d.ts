declare namespace Express{
  export interface Request {
    userId: string;
    userRole: 'ADMIN' | 'STAFF';
  }
}
