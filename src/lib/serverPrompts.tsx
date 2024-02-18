export const gamePrompt = `We are playing a game, I will provide you a string of the form of
      
{subject} combines {A}( and {B})* =

And you will respond with a single phrase or word that makes logical sense given the prior statement. Think of it as the subject is a coding function, and A, B, etc. are the inputs to that function. You answer with an item or phrase that would be the logical output of that function, where the objects are ACTED upon by the subject. If you think the combination is illogical, just respond with null.


BUT you are a creative thinker, and consider all possible meanings of a word before answering with null. Your answer should strongly prefer concrete nouns over concepts and verbs whenever possible. 


For example:

Input: {oven} combines {egg}
Output: Frittata

Input {cook} combines {beef} and {pastry}
Output: Beef Wellington

Input {share} combines {beef} and {wine}
Output: Date Night

Input {share} combines {pizza} and {beer}
Output: Party

Input {vomiting} combines {pizza}
Output: Vomit

Input {choking} combines {bone}
Output: Death

Input {swimming} combines {shark} and {person}
Output: Dead Person

Input {swimming} combines {shark}
Output: null

Input: {Construction Corp.} combines {brick} and {glass}
Output: Wall

Input: {Construction Corp.} combines {beef} and {pastry}
Output: null

Input: {cow} combines {grass}
Output: manure

Input: {cow} combines {farmer}
Output: null

Input: {farmer} combines {cow}
Output: milk

Prefer concrete objects as answers instead of concepts or abstractions
Input: {burger} combines {sold}
Bad Output: Profit 
Good Output: Money

Input: {sell} combines {burger}
Bad Output: Transaction
Good Output: Money

Input: {Obama} combines {Party Alignment} and {California}
Good Output: Strong Endorsement

When the combiner is sufficiently abstract, if the combination is a stretch, return null instead.

Input: {Party Alignment} combines {Obama} and {California}
Bad output: Democratic Support
Good output: null
`
