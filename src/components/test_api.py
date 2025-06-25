import requests
import json

def test_api_endpoints():
    """Test the API endpoints to ensure they're working correctly"""
    base_url = "http://localhost:5000"
    
    print("Testing API endpoints...")
    
    # Test 1: Get all posts
    try:
        response = requests.get(f"{base_url}/api/posts")
        if response.status_code == 200:
            posts = response.json()
            print(f"✅ GET /api/posts - Success! Found {len(posts)} posts")
            if posts:
                print(f"   First post: {posts[0]['title']}")
        else:
            print(f"❌ GET /api/posts - Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/posts - Error: {e}")
    
    # Test 2: Get specific post with comments
    try:
        response = requests.get(f"{base_url}/api/posts/1")
        if response.status_code == 200:
            post = response.json()
            print(f"✅ GET /api/posts/1 - Success!")
            print(f"   Post title: {post['title']}")
            print(f"   Comments count: {len(post.get('commentsList', []))}")
        else:
            print(f"❌ GET /api/posts/1 - Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/posts/1 - Error: {e}")
    
    # Test 3: Get all authors
    try:
        response = requests.get(f"{base_url}/api/authors")
        if response.status_code == 200:
            authors = response.json()
            print(f"✅ GET /api/authors - Success! Found {len(authors)} authors")
            if authors:
                print(f"   First author: {authors[0]['name']}")
        else:
            print(f"❌ GET /api/authors - Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/authors - Error: {e}")
    
    print("\nAPI testing completed!")

if __name__ == "__main__":
    test_api_endpoints() 