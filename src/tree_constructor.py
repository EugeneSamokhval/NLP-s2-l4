import nltk
from nltk import word_tokenize, pos_tag, sent_tokenize

grammar = nltk.RegexpParser(
    """
        NP: {<DT>?<JJ>*<NN.*>}
        P: {<IN>}
        V: {<V.*>}
        PP: {<P> <NP>}
        VP: {<V> <NP|PP>*}
        S:  {<NP> <VP>}
        """
)


def get_tree(text: str):
    result = []
    for sentence in sent_tokenize(text):
        # Tokenize and POS tag the text
        tokens = word_tokenize(sentence)
        pos_tags = pos_tag(tokens)
        # Parse the tagged text
        parsed_text = grammar.parse(pos_tags)
        result.append(parsed_text)
    return result
