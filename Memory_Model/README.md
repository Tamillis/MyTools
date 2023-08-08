
<img src="https://boolerang.co.uk/wp-content/uploads/job-manager-uploads/company_logo/2018/04/SG-Logo-Black.png" alt="Sparta Logo" width="200"/>

---

# The .NET Memory model

## Timings
- Lesson - 90 minutes
- Plus optional Exercise (Swap 2 numbers) - 15 mins

## Contents
<!-- TOC titleSize:2 tabSpaces:2 depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 skip:0 title:1 charForUnorderedList:* -->
## Table of Contents

* [Timings](#timings)
* [Contents](#contents)
* [Prerequisites](#prerequisites)
* [SWBAT - "Students Will Be Able To"](#swbat---students-will-be-able-to)
* [Video Links](#video-links)
* [Set-up](#set-up)
* [Introduction](#introduction)
  * [Value types](#value-types)
  * [Reference types](#reference-types)
  * [Stack](#stack)
  * [Heap](#heap)
* [Walkthrough - Stack and heap memory](#walkthrough---stack-and-heap-memory)
* [Calling a Method](#calling-a-method)
  * [Walkthrough - Method calls](#walkthrough---method-calls)
  * [Value vs Reference Types](#value-vs-reference-types)
* [Pass by Reference](#pass-by-reference)
  * [Reference keywords](#reference-keywords)
* [Exercise - Swap two numbers](#exercise---swap-two-numbers)
* [Further Reading](#further-reading)
<!-- /TOC -->

## Prerequisites
- C# Core [Methods lesson](https://github.com/spartaglobal/CSharpCurriculum/tree/master/CSharp-Core/06_Methods_Memory/Methods)

## SWBAT - "Students Will Be Able To"
* **EXPLAIN** the difference between value and reference types
* **EXPLAIN** how stack and heap memory work.
* **DESCRIBE** the role of the .NET garbage collector

## Video Links
None

## Set-up

> #### TRAINER PROMPT
> The only thing the trainees need to do before the lesson is to download the *MemoryModel* project, which you will have already modified according to the instructions below.

> The rest of these set-up instructions are for the trainer.

Watch the [video](https://testingcircle.sharepoint.com/sites/BusinessMaster/Shared%20Documents/Engineering%2090/Recordings/CSharp%20OOP/DotNet%20Memory%20Model.mp4) for an example of this lesson in action

For face-to-face teaching you will need
* post-it notes or index cards
* lengths of string or ribbons
* tape

or, if working remotely, a means of visualising the stack, heap and their contents.  This could be
- a whiteboard
- a [Miro board](https://miro.com/)
- a Word or Powerpoint file
  - You could copy and use the powerpoint template [SlidesForMemoryDemo.ppx](https://testingcircle.sharepoint.com/:f:/r/sites/TrainingDelivery/Shared%20Documents/General/TRAINING%20ASSETS/C%23/CSharpBasics?csf=1&web=1&e=WdgfMK)

Before the class
- download the [Memory Model solution](https://github.com/spartaglobal/CSharpCurriculum/tree/master/CSharp-Core/06_Methods_Memory/Memory_Model)
- replace the names in the code with those of your own trainees (unless you prefer to rename your trainees)
- make the solution available for the trainees to download.

## Introduction
> #### TRAINER PROMPT
> This lesson is more a walkthrough than a code-along.  The code is already complete.  What we are going to do is step through it line by line and demonstrate the effect of each statement on the stack and the heap.
> If working remotely, trainees can follow along stepping through their own code (or they can just watch the demo)

In this lesson we are going to talk about how memory is managed by the .NET runtime system.  We aren't going to go into detail about how memory works - this can be quite complicated.

As programmers we just need a high level mental model of what's going on and how it affects the code we write.  Remember the butler from the introductory lesson - the butler will take care of the details.

We will look at the difference between value and reference types, and the stack and the heap.

> #### TRAINER PROMPT
> Go through the following to set the scene but don't spend a lot of time explaining it - the demostration that follows will illustrate all the concepts in action

> Keep referring to these points throughout the demo.  If you prefer, you can go straight to the demo and introduce these concepts as you go.

### Value types
**Value types** stores their data directly.  These include
- the numeric types: integral and floating point
- char
- bool
- enum
- struct

Each variable has its own copy of the data

Assignment (`x = y;`) copies the data held in variable `y` into variable `x`

### Reference types
**Reference types** store a reference to where to find its data (the *address*)

Two or more reference variables can reference the same data

Assignment (`x = y;`) copies the *address* held in variable `y` into variable `x`

### Stack
The **stack** is an area of fast-access memory where variables are stored as they are declared
- Last in, first out

Variables in the stack could value types, or references

Local variables are popped off the stack when they go out of scope

### Heap
- The **heap** is a larger area of memory which holds the data belonging to reference types
- When a new reference type is created, the system finds space for it on the heap
- The reference variable stores this address, not the data itself
  - if a reference variable does not have any data to point to, it has the value `null`

Let's see all this in action.

## Walkthrough - Stack and heap memory
> #### TRAINER PROMPT
> Open up the *MemoryModel* solution and share your screen.  

> If working remotely, also show the whiteboard / document you are using to visualise the stack and heap.

> If working in the classroom, designate one wall of the class room as the stack.  As each trainee is declared, ask them to stand in the next position on the stack.

> Put a breakpoint on the first line of the `Program` `Main` method.

> Step through the code below line by line (see below).  If remote, the trainees can do the same, or they can just watch the demo.

```csharp
int jacob = 4;
```
jacob is a **value** type.  Enough space in the stack is reserved to hold an `int` (4 bytes) and the value `4` is stored there directly.
> #### Trainer note
> If in the classroom, give Jacob a post-it note and write the number `4` it.  Ask him to stand in the first postion of the stack.

> If working remotely, push the name `jacob` and value `4` onto your representation of the stack.

```csharp
string ronil = "Ronil";
```
ronil is a **reference** type.   

The run-time system finds space to store a string containing 5 characters, and gives ronil a reference (the address) to it

>#### Trainer note
> If in the classroom, ask Ronil to stand next to Jacob on the stack.  Put a piece of paper with "Ronil" on the table.  Tape one end of a length of string to it, and give the other end to Ronil.

> If working remotely, write the name `ronil` in the next positon in the stack.  Ask Ronil what value should be stored there.  Write the letters "ronil" on the heap and draw an arrow from `ronil` on the stack to the `r` on the heap.

> Carry on stepping through the rest of the code in the same manner (see below).  

>  Get the trainees involved - ask them what is happening to "their" variable rather than just telling them.

```csharp
int[] keagan = { 6, 7, 2 };
```
Arrays are reference types.  Keagan will hold a reference to the first element of the array (6), which is on the heap
```csharp
for (var will = 0; will < keagan.Length; will++)

{ Console.WriteLine(keagan[will]); }
```
Step through the code showing that as `will` increments, he addresses each position in the array in turn.
```csharp
double denzel = 3.14159;
```
`denzel` is a double so takes up twice as much space (8 bytes) as the other variables so far
```csharp
var atchu = jacob;
```
`jacob` is an `int` so `atchu` is also an `int`.  `atchu` stores a copy of `jacob`'s value, `4`.
```csharp
jacob++;
```
`jacob`'s value is incremented to `5`, but `atchu`'s stays the same
```csharp
string[] sabir = { "cat", "dog" };
```
This is another array (reference type, so stored on the heap), but this time the contents of the array are themselves references (to `string`s).
> #### TRAINER PROMPT
> Draw arrows from each array position to its string (or use lengths of string).

```csharp
{
    var chris = keagan;
```
Note the `{`.  We are entering a new code block.  All the variables declared within the block will go out of scope when the block exits `}`.

> #### TRAINER PROMPT
> Draw a line on the stack between `keagan` and `chris`

`keagan` is a array of ints, so is `chris`.  They both point to the same memory position on the heap.
```csharp
    chris[2] = 42;
```
The last element of `chris` is now `42`.  What about `keagan`?  He will see the same.
```csharp
    string[] umar = { "perch", "cod", "eel" };
```
Another array of strings.
```csharp
    sabir = umar;
    sabir[1] = "bass";
```
Lots of action here.  `sabir` and `umar` are now pointing to the same memory position on the heap.  They both have `"bass"` instead of `"perch"` at position `1`.

Noticd that `sabir` was holding a reference an array of size 2, and now is referencing an array of size 3.  That's possible because `sabir` is holding a reference rather than the actual value - the space taken up on the stack hasn't changed.

> #### QUESTION
> What happens to `sabir`'s original array and the strings it points to?
Answer - they are no longer reachable from the stack.  They will stay there, unused, until the garbage collector runs (more about this later).
```csharp
    var sam = ronil;
```
Another reference assignment.
```csharp
    ronil = umar[0];
```
Notice that `ronil` is a string, so he can't access the whole array, just the string `"perch"`.
```csharp
}
```
We have reached the end of the code block.  The variables on the stack are popped off one at a time.

> TRAINER PROMPT
> Erase the variable names and their values from the stack one by one until you reach the line on the stack (end of the code block).  If in the classroom, ask the trainees to sit down one by one from the top of the stack, and give back their post-it note or string.

Before we move on, we are going to run the garbage collector.  

As we have seen, reference variables can go out of scope or be reassigned, leaving objects in memory that are not referenced by anything.

If they were left they would eventually fill up the heap memory.  

If we didn't do anything about it, this would be a memory leak.  This is a big problem in C/C++ programs where the programmer has to manually manage the heap memory.

However, .NET (and Java) use a garbage collector.  Periodically the garbage collector runs to free up memory and compacts the heap

The garbage collector normally runs when the heap memory is getting full.  This is a small program so there is no need to for it to run here, but let's see what would happen if it did.

The garbage collector does three things:
- Identifies objects on the heap that are no longer reachable from the stack (dead)
> #### TRAINER PROMPT
> Get the trainees to identify the unreachable heap objects
- Frees up this memory and making it available for re-allocation.
> #### TRAINER PROMPT
> Erase these object from the heap / take them off the table
- Moves the live objects closer to each other to optimise space (compaction)
> #### TRAINER PROMPT
> Rearrange the remaining heap objects so they are next to each other.

The program hasn't quite finished, we still have a few variables on the stack.
```csharp
denzel = keagan[2];
```
`denzel` is now holding the value `42.0` (remember `denzel` is a `double`)
```csharp
}
```
We have reached the end of the program.  Both the stack and heap memory are released to the system.

> #### TRAINER PROMPT
> Stop showing the demo slide / whiteboard, or ask the remaining trainees to sit down and clear the table.

## Calling a Method

We'll now look at what happens in memory when you call a method.

The arguments used in method calls are copied into the method's memory space as local parameters

If the parameter is a value type, the value is copied
- Any modifications to it are local to the method
- this is know as pass by value

If the parameter is a reference, the reference ("address") is copied
- Both the calling method and the current method  now reference the same area of memory on the heap
- Any modifications to the referenced object will be visible to the calling method
- This is actually pass by value as well, but the *value* is reference to the memory on the heap

### Walkthrough - Method calls
> #### CODE-ALONG
> Comment out all the code in `Program.cs` and uncomment all of `PassToMethod.cs`

> Explain that code project can have only one `Main` method

> Put a breakpoint on the first line of `PassToMethod.cs` and step through it as before (notes below)

```csharp
Person tak = new Person { FirstName = "Tak", LastName = "Li", Age = 25 }
double jacob = 4.2;
```
> #### TRAINER PROMPT
> Set up `tak` and `jacob` as before.  
>
> Represent the `Person` object on the heap as three named areas of memory, the property backing fields `_firstName`, `_lastName` and `_age`.  `_firstName` and `_lastName` contain pointers to strings, while `_age` holds the value `25` directly.

```csharp
string keagan = DemoMethod(tak, jacob);
```
`keagan` goes on to the stack, but we won't be assigning him a value until the method returns.  In the meantime, give him the default `string` value, `null`.

Now we are calling `DemoMethod`
> #### TRAINER PROMPT
> Put a line on the stack after to `keagan`.

We are now entering the scope of the method.
```csharp
 public static string DemoMethod(Person denzel, double umar)
{
```
The reference held by `tak` is copied to `denzel`, and `jacob`s value is copied to `umar`
> #### TRAINER PROMPT
> Put `denzel` then `umar` on the stack.  Give `denzel` an arrow or string pointing to `tak`s `Person` object on the heap.  Assign `4.2` to `umar`

```csharp
denzel.LastName = "Sawyer";
denzel.Age = 26;
umar *= 2;
```
> #### TRAINER PROMPT
> Demo these as before, updating the values held by each.

```csharp
return denzel.FirstName;
```
The method returns.

The value held by `denzel.FirstName` ("Tak") is assigned to `keagan`.

`denzel` and `umar` are popped off the stack.

> #### TRAINER PROMPT
> Remove these two, and erase the line drawn on the stack representing the start of the `DemoMethod` memory space.

`tak` still has the first name `"Tak"`, but now has a new last name `"Sawyer"` and age `26`.

Let's pause here to consider why .NET has both value and reference types.

### Value vs Reference Types

It's all a matter of time and space.

Value types are small and fixed size
- `int` 4 byte, `double` 8 byte
- Why would we want to store the address (4 byte) of an `int` when we can store the data itself?
- Copying the address (eg in a method call) would take the same amount of time as copying the actual data

Reference types are generally larger and have variable size.
- Copying an reference is much faster than copying the referenced object (time)
- And the copied object takes up space

Using reference types allow complex objects to be made containing references to other reference types
- for example, the `Person` object had references to `string` objects

Referenced objects of the same type but different size can be substituted
- as we did when changing the `Person` object last name

But beware:
- When providing a reference type as a method argument, be aware that it CAN be changed by the method
  - Often this is a good thing, such as a method to fill an array with user input
- When providing a value type as a method argument, be aware than it CANNOT be changed by the method
  - Any changes made in the method are made to the copy, not the original

## Pass by Reference
We can change the value of a value type by treating it as reference.

This is not usual practice, but it can be useful.  We have already seen an example, the `TryParse` method.

> #### CODEALONG
> Continue stepping through the program

```csharp
int chris;
```
`chris` is given the default `int` value of `0`.
```csharp
var success = Int32.TryParse("632", out chris);
```
We are now calling the C# library method `Int32.TryParse`.  
The method assigns the `int` `632` to `chris`, and returns `true`, which is assigned to `success`.

`chris` is an `out` value, meaning he was passed by reference to `Int32.TryParse` (even though he is an `int`)

Lets call another method that uses both `in` and `out` reference values.

```csharp
int sabir = 42;
PassByReference(sabir, out int atchu);
```
> #### TRAINER PROMPT
> Add and initialise `sabir`, then draw another line on the stack.  

```csharp
public static void PassByReference(in int denzel, out int umar)
{
```
> #### TRAINER PROMPT
> Push `denzel` on to the stack, and draw an arrow (or hand him a string) pointing to `sabir` on the **stack** (not heap)

> Do the same for `umar` and `atchu`
```csharp
umar = 2 * denzel;
}
```
`umar` is holding a reference to `atchu`, who is assigned the value 84 (`denzel` * 2);

The method returns.  `denzel` and `umar` are taken off the stack.  

> #### TRAINER PROMPT
> Erase `umar` and `denzel` (or tell them to sit down)

```csharp
Console.WriteLine(atchu);
```
Notice that the scope of `atchu` is from the point he was declared until the end of the `Main` method.  So we can still access `atchu` and write out his value.

### Reference keywords

There are 3 different keywords that we can use to indicate that a *value* type should be passed by *reference*:
- `ref`
  - the variable **must** be declared before it is passed
  - it **can** be changed in the method
- `in`
  - the variable **must** be declared and initialised before it is passed
  - it **can't** be changed in the method � **read** only
- `out`
  - the variable **doesn't have to be** declared before it is passed
  - it **must** be changed (assigned a value) in the method

Use reference variables with care - in most cases you won't need them.

However sometimes they come in useful, for example if you want to write a method to swap two numbers.

## Exercise - Swap two numbers
(15 mins, do if time permits)

Write a method swap to swap two numbers

> #### TRAINER PROMPT
> Get some trainees to show their answers.  It should look like

```csharp
public static void Swap(ref int a, ref int b)
{
    int c = a;
    a = b;
    b = c;
}
```
and be invoked in the `Main` method like:
```csharp
int x = 2, y = 5;
Swap(ref x, ref y);
```

## Further reading
Value types
- https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types

Reference types
- https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types

Garbage Collection
- https://docs.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals
- this goes into more detail that we need for this course, but you might find it interesting/useful)

Reference keyword
- https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/ref
- again this goes into more detail and scenarios than you need.  

Also look up the `in` and `out` keywords from
- https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/
