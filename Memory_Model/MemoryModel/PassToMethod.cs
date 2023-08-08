//using System;

//namespace MemoryModel
//{
//    public class Person
//    {
//        public string FirstName { get; set; }
//        public string LastName { get; set; }
//        public int Age { get; set; }
//    }
//    class PassToMethod
//    {
//        public static void Main()
//        {
//            Person tak = new Person { FirstName = "Tak", LastName = "Li", Age = 25 };
//            double jacob = 4.2;
//            string keagan = DemoMethod(tak, jacob);
//            int chris;
//            var success = Int32.TryParse("632", out chris);
//            int sabir = 42;
//            PassByReference(sabir, out int atchu);
//            Console.WriteLine(atchu);
//        }
//        public static string DemoMethod(Person denzel, double umar)
//        {
//            denzel.LastName = "Sawyer";
//            denzel.Age = 26;
//            umar *= 2;
//            return denzel.FirstName;
//        }

//        public static void PassByReference(in int denzel, out int umar)
//        {
//            umar = 2 * denzel;
//        }
//    }
//}
